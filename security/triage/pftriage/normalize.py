"""Parsers: scanner JSON -> list[Finding].

Each parser copies ONLY metadata fields into a Finding. Code snippets, secret values,
HTTP request/response evidence, commit authors and emails are never copied.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .models import Finding, norm_severity

CWE_RE = re.compile(r"CWE-\d+", re.I)


def _cwes(values) -> list[str]:
    out: list[str] = []
    if not values:
        return out
    if isinstance(values, str):
        values = [values]
    for v in values:
        for m in CWE_RE.findall(str(v)):
            m = m.upper()
            if m not in out:
                out.append(m)
    return out


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text or "").replace("&nbsp;", " ").strip()


def _first_line(text: str, limit: int = 160) -> str:
    text = (text or "").strip().splitlines()[0] if (text or "").strip() else ""
    return text[:limit]


def _short_rule(check_id: str) -> str:
    # semgrep ids look like "rules.semgrep-rules.javascript.express.security.x.rule-name"
    # or "javascript.express.security.audit.rule-name" (registry). Keep the meaningful tail.
    parts = check_id.split(".")
    return ".".join(parts[-3:]) if len(parts) > 3 else check_id


# ---------------------------------------------------------------- Semgrep (SAST)
def parse_semgrep(data: dict) -> list[Finding]:
    out = []
    for r in data.get("results", []):
        extra = r.get("extra", {})
        meta = extra.get("metadata", {}) or {}
        rule = _short_rule(r.get("check_id", ""))
        sev = norm_severity(extra.get("severity"))
        is_secret_rule = "secret" in r.get("check_id", "") or "gitleaks" in r.get("check_id", "")
        out.append(Finding(
            tool="semgrep",
            stage="sast",
            rule_id=rule,
            # the semgrep message can quote code; keep only its first sentence, redact.py scrubs it again
            title=_first_line(extra.get("message", rule)).split(". ")[0],
            severity=sev if not is_secret_rule else "HIGH",
            file=r.get("path", ""),
            line=int(r.get("start", {}).get("line", 0) or 0),
            cwe=_cwes(meta.get("cwe")),
            url=(meta.get("references") or [""])[0] if isinstance(meta.get("references"), list) else "",
            confidence=str(meta.get("confidence", "")),
        ))
        # deliberately NOT copied: extra.lines (source code), extra.fix, extra.dataflow_trace
    return out


# ---------------------------------------------------------------- gitleaks (secrets)
def parse_gitleaks(data: list) -> list[Finding]:
    out = []
    for r in data:
        rule = r.get("RuleID", "secret")
        out.append(Finding(
            tool="gitleaks",
            stage="secrets",
            rule_id=rule,
            title=r.get("Description", "Hard-coded secret"),
            severity="CRITICAL" if "private-key" in rule else "HIGH",
            file=r.get("File", ""),
            line=int(r.get("StartLine", 0) or 0),
            cwe=["CWE-798"],
        ))
        # deliberately NOT copied: Secret, Match, Author, Email, Commit message
    return out


# ---------------------------------------------------------------- Trivy (SCA fs + container image)
def parse_trivy(data: dict) -> list[Finding]:
    out = []
    image = data.get("ArtifactType") == "container_image"
    stage = "container" if image else "sca"
    artifact = data.get("ArtifactName", "")
    for res in data.get("Results", []) or []:
        target = res.get("Target", "")
        for v in res.get("Vulnerabilities", []) or []:
            vid = v.get("VulnerabilityID", "")
            out.append(Finding(
                tool="trivy",
                stage=stage,
                rule_id=vid,
                title=_first_line(v.get("Title") or f"{v.get('PkgName')} vulnerability"),
                severity=norm_severity(v.get("Severity"), "LOW"),
                file=target,
                package=v.get("PkgName", ""),
                installed_version=v.get("InstalledVersion", ""),
                fixed_version=v.get("FixedVersion", "") or "",
                vuln_ids=[vid] + [a for a in (v.get("VendorIDs") or []) if a != vid],
                cwe=_cwes(v.get("CweIDs")),
                url=v.get("PrimaryURL", ""),
                resource=artifact if image else "",
            ))
        for m in res.get("Misconfigurations", []) or []:
            out.append(Finding(
                tool="trivy", stage="iac" if not image else "container",
                rule_id=m.get("ID") or m.get("AVDID", ""),
                title=_first_line(m.get("Title", "")),
                severity=norm_severity(m.get("Severity")),
                file=target, url=m.get("PrimaryURL", ""),
            ))
        for s in res.get("Secrets", []) or []:
            out.append(Finding(
                tool="trivy", stage="secrets",
                rule_id=s.get("RuleID", "secret"),
                title=s.get("Title", "Secret in image"),
                severity=norm_severity(s.get("Severity"), "HIGH"),
                file=target, line=int(s.get("StartLine", 0) or 0), cwe=["CWE-798"],
                resource=artifact if image else "",
            ))
            # deliberately NOT copied: Match, Code.Lines (contain the secret)
    return out


# ---------------------------------------------------------------- Checkov (IaC + policy-as-code)
CHECKOV_SEVERITY_DEFAULTS = {
    # Checkov OSS returns severity=null without a platform key, so we set sensible
    # defaults for the checks that matter most. Everything else is MEDIUM.
    "CKV_K8S_16": "HIGH",   # privileged container
    "CKV_K8S_20": "HIGH",   # allowPrivilegeEscalation
    "CKV_K8S_23": "HIGH",   # root containers admitted
    "CKV_K8S_40": "MEDIUM",
    "CKV_DOCKER_3": "HIGH",  # no non-root user
    "CKV_DOCKER_7": "MEDIUM",
    "CKV_DOCKER_2": "LOW",   # healthcheck
    "CKV_AWS_260": "HIGH",
    "CKV_AWS_2": "MEDIUM",
    "CKV_DOCKER_8": "HIGH",  # last USER is root
    "CKV2_GHA_1": "HIGH",    # workflow token with write-all
    "PF_GHA_1": "HIGH",      # unpinned third-party action (supply chain, CVE-2026-33634)
    "PF_DOCKER_1": "HIGH",   # image user not verifiable as non-root
}


def parse_checkov(data) -> list[Finding]:
    out = []
    blocks = data if isinstance(data, list) else [data]
    for block in blocks:
        if not isinstance(block, dict) or "results" not in block:
            continue
        for c in block["results"].get("failed_checks", []) or []:
            cid = c.get("check_id", "")
            sev = c.get("severity") or CHECKOV_SEVERITY_DEFAULTS.get(cid, "MEDIUM")
            rng = c.get("file_line_range") or [0, 0]
            out.append(Finding(
                tool="checkov",
                stage="iac",
                rule_id=cid,
                title=c.get("check_name", cid),
                severity=norm_severity(sev),
                file=(c.get("repo_file_path") or c.get("file_path") or "").lstrip("/"),
                line=int(rng[0] or 0),
                resource=c.get("resource", ""),
                url=c.get("guideline") or "",
            ))
            # deliberately NOT copied: code_block (the IaC source)
    return out


# ---------------------------------------------------------------- OWASP ZAP baseline (DAST)
ZAP_RISK = {"3": "HIGH", "2": "MEDIUM", "1": "LOW", "0": "INFO"}


def parse_zap(data: dict) -> list[Finding]:
    out = []
    for site in data.get("site", []) or []:
        for a in site.get("alerts", []) or []:
            instances = a.get("instances", []) or []
            # keep only the URL *path* of the first instance; drop query strings and evidence
            path = ""
            if instances:
                path = re.sub(r"^https?://[^/]+", "", instances[0].get("uri", "")).split("?")[0]
            cwe = a.get("cweid")
            out.append(Finding(
                tool="zap",
                stage="dast",
                rule_id=f"ZAP-{a.get('pluginid', '')}",
                title=a.get("alert") or a.get("name", ""),
                severity=ZAP_RISK.get(str(a.get("riskcode")), "LOW"),
                file=path,
                cwe=[f"CWE-{cwe}"] if cwe and str(cwe) not in ("-1", "0") else [],
                confidence=str(a.get("confidence", "")),
            ))
            # deliberately NOT copied: instances[].evidence/attack/param, otherinfo (may hold cookies, tokens)
    return out


# ---------------------------------------------------------------- npm audit (fallback SCA for laptops without Trivy)
def parse_npm_audit(data: dict) -> list[Finding]:
    out = []
    for name, v in (data.get("vulnerabilities") or {}).items():
        for via in v.get("via", []):
            if not isinstance(via, dict):
                continue  # transitive pointer, the root advisory is listed under its own package
            ghsa = (via.get("url") or "").rstrip("/").split("/")[-1]
            fix = v.get("fixAvailable")
            fixed = fix.get("version", "") if isinstance(fix, dict) and fix.get("name") == name else ""
            out.append(Finding(
                tool="npm-audit", stage="sca",
                rule_id=ghsa or str(via.get("source", "")),
                title=_first_line(via.get("title", "")),
                severity=norm_severity(via.get("severity")),
                file="package-lock.json",
                package=name, installed_version=v.get("range", ""), fixed_version=fixed,
                vuln_ids=[ghsa] if ghsa.startswith("GHSA") else [],
                cwe=_cwes(via.get("cwe")), url=via.get("url", ""),
            ))
    return out


# ---------------------------------------------------------------- dispatch
def detect_and_parse(path: Path) -> list[Finding]:
    """Detect the scanner from the JSON shape (file names are not trusted)."""
    text = path.read_text(encoding="utf-8", errors="replace").strip()
    if not text:
        return []
    data = json.loads(text)
    if isinstance(data, dict) and ("bomFormat" in data or "spdxVersion" in data or "artifactRelationships" in data):
        return []  # an SBOM, not findings
    if isinstance(data, dict) and "results" in data and "version" in data and isinstance(data["results"], list):
        return parse_semgrep(data)
    if isinstance(data, dict) and "SchemaVersion" in data and "Results" in data:
        return parse_trivy(data)
    if isinstance(data, dict) and "@programName" in data or (isinstance(data, dict) and "site" in data):
        return parse_zap(data)
    if isinstance(data, dict) and "auditReportVersion" in data:
        return parse_npm_audit(data)
    if isinstance(data, dict) and data.get("check_type") or (
        isinstance(data, list) and data and isinstance(data[0], dict) and "check_type" in data[0]
    ):
        return parse_checkov(data)
    if isinstance(data, dict) and "summary" in data and "results" not in data:
        return []  # checkov with no findings
    if isinstance(data, list) and (not data or "RuleID" in data[0]):
        return parse_gitleaks(data)
    if isinstance(data, dict) and isinstance(data.get("results"), list):
        return parse_semgrep(data)
    raise ValueError(f"Unrecognised scanner output: {path}")


def load_dir(directory: Path) -> list[Finding]:
    findings: list[Finding] = []
    for p in sorted(Path(directory).rglob("*.json")):
        if p.name.startswith("_") or p.name in {"normalized.json", "triage.json", "metrics.json"}:
            continue
        try:
            findings.extend(detect_and_parse(p))
        except (ValueError, json.JSONDecodeError) as exc:
            print(f"[normalize] skipping {p}: {exc}")
    return findings
