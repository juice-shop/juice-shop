"""Redaction layer: the only door between the build runner and an external LLM.

Four layers, applied in order. Each one alone would be leaky; together they fail closed.

  1. ALLOWLIST   Only named metadata fields of a Finding are ever serialized. Code snippets,
                 secret values and HTTP evidence were already dropped by the parsers.
  2. CATEGORY    Secret findings are never sent at all. They are handled locally with a fixed
                 playbook (rotate, purge history, move to a vault) because describing a leaked
                 credential to a third party is itself a disclosure.
  3. SCRUB       Every string that is sent is scrubbed for secret patterns, high-entropy tokens,
                 code fragments, emails, IPs, internal hostnames and project identifiers. File
                 paths are replaced by aliases (FILE_03.ts) so the repo layout does not leave.
  4. VERIFY      The final serialized prompt is re-scanned with every detector. Any hit raises
                 RedactionError and NOTHING is sent (fail closed). Every outbound payload is
                 also written to an audit folder that CI scans again with gitleaks.
"""
from __future__ import annotations

import fnmatch
import json
import math
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None


class RedactionError(RuntimeError):
    """Raised when a payload still contains sensitive data after redaction. Nothing is sent."""


# --------------------------------------------------------------------------- detectors
SECRET_PATTERNS: dict[str, re.Pattern] = {
    "pem-private-key": re.compile(r"-----BEGIN[A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END[A-Z ]*PRIVATE KEY-----|$)"),
    "aws-access-key-id": re.compile(r"\b(A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z2-7]{16}\b"),
    "github-token": re.compile(r"\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{22,})\b"),
    "google-api-key": re.compile(r"\bAIza[0-9A-Za-z\-_]{35}\b"),
    "slack-token": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b|hooks\.slack\.com/services/[A-Za-z0-9/]+"),
    "stripe-key": re.compile(r"\b[rs]k_(live|test)_[0-9a-zA-Z]{16,}\b"),
    "llm-api-key": re.compile(r"\bsk-(ant-|proj-)?[A-Za-z0-9_\-]{20,}\b"),
    "jwt": re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"),
    "credential-in-url": re.compile(r"[a-zA-Z][a-zA-Z0-9+.-]*://[^\s:/@]+:[^\s@/]+@"),
    "assignment": re.compile(
        r"(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|"
        r"client[_-]?secret|auth)\b\s*[:=]\s*['\"]?([^\s'\",;]{6,})"
    ),
}

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
IPV4_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
BENIGN_IPS = {"0.0.0.0", "127.0.0.1", "255.255.255.255"}
TOKEN_RE = re.compile(r"[A-Za-z0-9+/=_\-]{24,}")
CODE_FENCE_RE = re.compile(r"```[\s\S]*?(```|$)")
INLINE_CODE_RE = re.compile(r"`[^`\n]{1,200}`")
CODE_HINTS = re.compile(
    r"(;\s*$|[{}]|=>|===|!==|\$\{|\bfunction\b|\bconst\b|\blet\b|\bvar\b|\breturn\b|\brequire\(|"
    r"\bimport\b|\bSELECT\b.*\bFROM\b|<script|\bawait\b|\.query\(|\bres\.\w+\()"
)
SAFE_ID_RE = re.compile(r"^(CVE-\d{4}-\d+|GHSA(-[0-9a-z]{4}){3}|CWE-\d+|CKV2?_[A-Z0-9_]+|PF_[A-Z0-9_]+|ZAP-\d+|FILE_\d+(\.\w+)?|C\d+)$")


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    n = len(s)
    return -sum(c / n * math.log2(c / n) for c in counts.values())


def looks_like_secret_token(tok: str) -> bool:
    """High-entropy random-looking token (base64 / hex keys)."""
    if SAFE_ID_RE.match(tok) or len(tok) < 24:
        return False
    has_digit = any(c.isdigit() for c in tok)
    has_upper = any(c.isupper() for c in tok)
    has_lower = any(c.islower() for c in tok)
    if re.fullmatch(r"[0-9a-f]{32,}", tok):          # hex keys / hashes
        return shannon_entropy(tok) > 3.0
    return has_digit and has_upper and has_lower and shannon_entropy(tok) > 4.0


def is_code_like(line: str) -> bool:
    return len(CODE_HINTS.findall(line)) >= 2 or bool(re.search(r";\s*$", line.strip()) and "(" in line)


# --------------------------------------------------------------------------- config
@dataclass
class RedactionConfig:
    identifiers: list[str] = field(default_factory=list)          # org / product / repo names
    internal_host_suffixes: list[str] = field(default_factory=lambda: [".internal", ".corp", ".local", ".lan"])
    alias_paths: bool = True
    max_field_len: int = 240
    # files whose *configuration* content may be sent when drafting a fix (never application source)
    fix_context_allow: list[str] = field(default_factory=lambda: [
        "package.json", "security/k8s/*.yaml", "security/Dockerfile.hardened", "Dockerfile",
    ])
    fix_context_deny: list[str] = field(default_factory=lambda: [
        "*.ts", "*.js", "*.mjs", "*.cjs", "*.py", "*.html", "*.env", "*.pem", "*.key", "encryptionkeys/*",
    ])

    @classmethod
    def load(cls, path: str | Path | None) -> "RedactionConfig":
        if not path or not Path(path).exists() or yaml is None:
            return cls()
        data = yaml.safe_load(Path(path).read_text()) or {}
        known = {k: v for k, v in data.items() if k in cls.__dataclass_fields__}
        return cls(**known)


# --------------------------------------------------------------------------- the redactor
class Redactor:
    def __init__(self, config: RedactionConfig | None = None):
        self.cfg = config or RedactionConfig()
        self.path_aliases: dict[str, str] = {}      # real path -> alias (kept local, never sent)
        self.events: Counter = Counter()             # what was redacted, for the report
        self.ident_aliases: dict[str, str] = {}      # "juice-shop" -> "ORGID_1" (reversible, local only)
        self.restore_lines: dict[str, str] = {}      # scrubbed config line -> original line (local only)
        ids = sorted({i for i in self.cfg.identifiers if i}, key=len, reverse=True)
        # "juice-shop" also matches juice_shop, juice shop and juiceshop
        alts = [r"[-_ .]?".join(re.escape(part) for part in re.split(r"[-_ .]+", i)) for i in ids]
        self._ident_re = re.compile("|".join(alts), re.I) if ids else None

    # ---- layer 3: scrubbing -------------------------------------------------
    def alias_path(self, path: str) -> str:
        if not path or not self.cfg.alias_paths:
            return path
        if path not in self.path_aliases:
            ext = Path(path).suffix.lower()
            self.path_aliases[path] = f"FILE_{len(self.path_aliases) + 1:02d}{ext}"
            self.events["path-aliased"] += 1
        return self.path_aliases[path]

    def _alias_ident(self, m: re.Match) -> str:
        word = m.group(0)
        if word not in self.ident_aliases:
            self.ident_aliases[word] = f"ORGID_{len(self.ident_aliases) + 1}"
        self.events["identifier"] += 1
        return self.ident_aliases[word]

    def unalias(self, text: str) -> str:
        """Map aliases in LLM output back to real paths / names (locally, after the response)."""
        for real, alias in sorted(self.path_aliases.items(), key=lambda kv: -len(kv[1])):
            text = text.replace(alias, real)
        for real, alias in sorted(self.ident_aliases.items(), key=lambda kv: -len(kv[1])):
            text = re.sub(re.escape(alias) + r"(?!\d)", real, text)
        return text

    def scrub(self, text: str) -> str:
        if not text:
            return text
        s = str(text)
        # code first: fences, inline code, code-looking lines
        s, n = CODE_FENCE_RE.subn("[code removed]", s)
        self.events["code-block"] += n
        s, n = INLINE_CODE_RE.subn("[code]", s)
        self.events["inline-code"] += n
        lines = []
        for line in s.splitlines() or [s]:
            if is_code_like(line):
                self.events["code-line"] += 1
                lines.append("[code removed]")
            else:
                lines.append(line)
        s = " ".join(lines)
        # secrets
        for name, pat in SECRET_PATTERNS.items():
            s, n = pat.subn(f"[REDACTED:{name}]", s)
            self.events[f"secret:{name}"] += n
        # high-entropy tokens
        def _tok(m):
            if looks_like_secret_token(m.group(0)):
                self.events["secret:high-entropy"] += 1
                return "[REDACTED:high-entropy]"
            return m.group(0)
        s = TOKEN_RE.sub(_tok, s)
        # PII and infrastructure identifiers
        s, n = EMAIL_RE.subn("[EMAIL]", s)
        self.events["email"] += n
        s, n = IPV4_RE.subn(lambda m: m.group(0) if m.group(0) in BENIGN_IPS else "[IP]", s)
        self.events["ip"] += n
        for suffix in self.cfg.internal_host_suffixes:
            s, n = re.subn(r"\b[\w.-]+" + re.escape(suffix) + r"\b", "[HOST]", s)
            self.events["internal-host"] += n
        if self._ident_re:
            s = self._ident_re.sub(self._alias_ident, s)
        # replace any real path that is still mentioned in free text
        for real, alias in self.path_aliases.items():
            if real and real in s:
                s = s.replace(real, alias)
        return s[: self.cfg.max_field_len]

    # ---- layers 1 + 2: allowlist view of a cluster ---------------------------
    ALLOWED_FIELDS = ("rule_id", "title", "severity", "stage", "tool", "package", "installed_version")

    def cluster_view(self, cluster) -> dict:
        """The ONLY representation of a finding cluster that may leave the runner."""
        if cluster.is_secret:
            raise RedactionError("secret clusters must never be sent to the LLM")
        f = cluster.representative
        view = {
            "cluster_id": cluster.cluster_id,
            "count": len(cluster.findings),
            "stages": sorted({x.stage for x in cluster.findings}),
            "files": sorted({self.alias_path(x.file) for x in cluster.findings if x.file})[:5],
            "dir_hints": sorted({Path(x.file).parts[0] for x in cluster.findings if x.file and len(Path(x.file).parts) > 1})[:3],
            "in_test_code": all(_is_test_path(x.file) for x in cluster.findings),
            "risk_score": cluster.risk_score,
        }
        for k in self.ALLOWED_FIELDS:
            v = getattr(f, k)
            if isinstance(v, list):
                view[k] = [self.scrub(str(i)) for i in v][:10]
            elif isinstance(v, str):
                view[k] = self.scrub(v)
            else:
                view[k] = v
        # cluster-wide facts, so the model can cite every advisory the scanners reported
        view["vuln_ids"] = [self.scrub(i) for i in sorted(cluster.vuln_ids)][:12]
        view["cwe"] = sorted(cluster.cwes)[:6]
        view["fixed_version"] = self.scrub(", ".join(sorted({x.fixed_version for x in cluster.findings if x.fixed_version}))[:80])
        if f.resource:
            view["resource_kind"] = self.scrub(f.resource.split(".")[0])
        for d in list(view["dir_hints"]):
            if self._ident_re and self._ident_re.search(d):
                view["dir_hints"].remove(d)
        return view

    # ---- config context for fix drafting (dependency / IaC only) -------------
    def fix_context_allowed(self, path: str) -> bool:
        if any(fnmatch.fnmatch(path, p) or fnmatch.fnmatch(Path(path).name, p) for p in self.cfg.fix_context_deny):
            return False
        return any(fnmatch.fnmatch(path, p) for p in self.cfg.fix_context_allow)

    def config_context(self, path: str, text: str, max_lines: int = 80) -> str:
        """Scrubbed configuration excerpt (YAML / Dockerfile / package.json). Never app source."""
        if not self.fix_context_allowed(path):
            raise RedactionError(f"{path} is not an allowed fix-context file")
        out = []
        for line in text.splitlines()[:max_lines]:
            clean = line
            for name, pat in SECRET_PATTERNS.items():
                clean, n = pat.subn(f"[REDACTED:{name}]", clean)
                self.events[f"secret:{name}"] += n
            clean = TOKEN_RE.sub(lambda m: "[REDACTED:high-entropy]" if looks_like_secret_token(m.group(0)) else m.group(0), clean)
            clean, n = EMAIL_RE.subn("[EMAIL]", clean)
            self.events["email"] += n
            if clean != line:
                self.restore_lines[clean] = line     # lets an untouched redacted line be restored later
            if self._ident_re:
                clean = self._ident_re.sub(self._alias_ident, clean)
            out.append(clean)
        return "\n".join(out)

    def restore_config(self, text: str) -> str:
        """Undo config_context() on an LLM-edited file. Lines that still carry a redaction marker
        must be byte-identical to what we sent; anything else means the model edited a secret line,
        which a human must do (raises RedactionError)."""
        text = self.unalias(text)
        out = []
        for line in text.splitlines():
            if "[REDACTED" in line or "[EMAIL]" in line:
                original = self.restore_lines.get(self.unalias(line)) or self.restore_lines.get(line)
                if original is None:
                    raise RedactionError("model modified a line that contains redacted data")
                line = original
            out.append(line)
        return "\n".join(out) + ("\n" if text.endswith("\n") else "")

    # ---- layer 4: verification ----------------------------------------------
    def verify(self, payload: str) -> None:
        """Re-scan the exact bytes that would be sent. Raise if anything sensitive remains."""
        problems = []
        for name, pat in SECRET_PATTERNS.items():
            for m in pat.finditer(payload):
                if "[REDACTED" not in m.group(0):
                    problems.append(name)
        for m in TOKEN_RE.finditer(payload):
            if looks_like_secret_token(m.group(0)):
                problems.append("high-entropy")
        if EMAIL_RE.search(payload):
            problems.append("email")
        if self._ident_re and self._ident_re.search(payload):
            problems.append("identifier")
        for real in self.path_aliases:
            if real and len(real) > 3 and real in payload:
                problems.append("real-path")
        if problems:
            raise RedactionError(f"payload blocked, still contains: {sorted(set(problems))}")

    def safe_payload(self, obj) -> str:
        payload = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
        self.verify(payload)
        return payload


def _is_test_path(path: str) -> bool:
    p = (path or "").lower()
    return any(t in p for t in ("test/", "tests/", "spec.", ".test.", "cypress/", "__tests__", "/fixtures/"))
