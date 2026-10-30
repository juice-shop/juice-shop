"""Common data model shared by every scanner parser.

Every scanner speaks its own JSON dialect. The parsers in normalize.py turn each one
into a list of `Finding` objects so the rest of the tool (gates, clustering, metrics,
LLM triage) never needs to know which scanner produced a result.

Important: a Finding deliberately has NO field for source code, secret values,
HTTP evidence, author names or emails. Parsers drop those at the door, so they can
never reach the LLM even if a later step has a bug (defence in depth).
"""
from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass, field

SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
SEVERITY_RANK = {s: i for i, s in enumerate(reversed(SEVERITIES))}  # INFO=0 ... CRITICAL=4

# Pipeline stage each tool belongs to (used for metrics and gates)
STAGES = ["secrets", "sast", "sca", "iac", "container", "dast"]


def norm_severity(value: str | None, default: str = "MEDIUM") -> str:
    if not value:
        return default
    v = str(value).strip().upper()
    aliases = {
        "ERROR": "HIGH",
        "WARNING": "MEDIUM",
        "WARN": "MEDIUM",
        "MODERATE": "MEDIUM",
        "INFORMATIONAL": "INFO",
        "NOTE": "LOW",
        "UNKNOWN": "LOW",
        "NONE": "INFO",
    }
    v = aliases.get(v, v)
    return v if v in SEVERITIES else default


def at_least(severity: str, threshold: str) -> bool:
    return SEVERITY_RANK[severity] >= SEVERITY_RANK[threshold]


@dataclass
class Finding:
    tool: str                      # semgrep | gitleaks | trivy | checkov | zap | npm-audit
    stage: str                     # one of STAGES
    rule_id: str                   # scanner rule / check / advisory id
    title: str                     # short human title (scanner provided)
    severity: str                  # normalized, one of SEVERITIES
    file: str = ""                 # repo-relative path, or target (image name / URL path)
    line: int = 0
    package: str = ""              # SCA / container findings
    installed_version: str = ""
    fixed_version: str = ""
    vuln_ids: list[str] = field(default_factory=list)   # CVE-..., GHSA-...
    cwe: list[str] = field(default_factory=list)        # CWE-89 ...
    resource: str = ""             # IaC resource (e.g. Deployment.default.juice-shop)
    url: str = ""                  # reference / guideline link from the scanner
    confidence: str = ""

    @property
    def fingerprint(self) -> str:
        """Stable identity that survives line shifts (used for baselines and dedup).

        Line numbers are excluded on purpose: inserting a line above a finding must not
        make an old finding look "new" and break the build.
        """
        parts = [self.tool, self.rule_id, self.file, self.package, self.resource, ",".join(sorted(self.vuln_ids))]
        return hashlib.sha256("|".join(parts).encode()).hexdigest()[:16]

    @property
    def is_secret(self) -> bool:
        return self.stage == "secrets" or "secret" in self.rule_id.lower() or "CWE-798" in self.cwe

    def to_dict(self) -> dict:
        d = asdict(self)
        d["fingerprint"] = self.fingerprint
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "Finding":
        known = {k: v for k, v in d.items() if k in cls.__dataclass_fields__}
        return cls(**known)
