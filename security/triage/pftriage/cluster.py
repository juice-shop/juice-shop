"""Deduplicate findings into clusters and score them deterministically.

Why deterministic scoring first? Priorities must be reproducible and explainable in an
audit. The LLM may *comment* on a priority (and propose at most one step up or down),
but it never invents the ranking on its own.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass, field

from .models import SEVERITY_RANK, Finding
from .redact import _is_test_path

SEVERITY_POINTS = {"CRITICAL": 40, "HIGH": 25, "MEDIUM": 12, "LOW": 4, "INFO": 1}
STAGE_CONFIDENCE = {        # how likely a finding from this stage is real and reachable
    "dast": 1.3,            # observed against the running app
    "secrets": 1.25,
    "sca": 1.0,
    "container": 0.9,       # often OS packages not used by the app
    "sast": 1.0,
    "iac": 0.85,
}
# CWE Top 25 (2024) subset relevant to web apps: small bonus
TOP25 = {"CWE-79", "CWE-89", "CWE-78", "CWE-22", "CWE-352", "CWE-434", "CWE-94", "CWE-502", "CWE-287",
         "CWE-306", "CWE-862", "CWE-863", "CWE-918", "CWE-798", "CWE-77", "CWE-20", "CWE-400", "CWE-1321"}


@dataclass
class Cluster:
    cluster_id: str
    key: str
    findings: list[Finding] = field(default_factory=list)
    risk_score: float = 0.0
    reasons: list[str] = field(default_factory=list)
    seen_stages: set = field(default_factory=set)   # stages that reported it, before dedup

    @property
    def representative(self) -> Finding:
        return max(self.findings, key=lambda f: SEVERITY_RANK[f.severity])

    @property
    def severity(self) -> str:
        return self.representative.severity

    @property
    def is_secret(self) -> bool:
        return any(f.is_secret for f in self.findings)

    @property
    def stages(self) -> list[str]:
        return sorted({f.stage for f in self.findings} | self.seen_stages)

    @property
    def vuln_ids(self) -> set[str]:
        return {v for f in self.findings for v in f.vuln_ids}

    @property
    def cwes(self) -> set[str]:
        return {c for f in self.findings for c in f.cwe}

    @property
    def fix_available(self) -> bool:
        return any(f.fixed_version for f in self.findings)

    def summary(self) -> dict:
        f = self.representative
        return {
            "cluster_id": self.cluster_id, "severity": self.severity, "risk_score": self.risk_score,
            "title": f.title, "rule_id": f.rule_id, "stages": self.stages, "count": len(self.findings),
            "package": f.package, "installed_version": f.installed_version,
            "fixed_versions": sorted({x.fixed_version for x in self.findings if x.fixed_version}),
            "vuln_ids": sorted(self.vuln_ids), "cwe": sorted(self.cwes),
            "files": sorted({x.file for x in self.findings if x.file})[:10],
            "is_secret": self.is_secret, "reasons": self.reasons,
        }


def cluster_key(f: Finding) -> str:
    """Findings with the same key describe the same underlying problem."""
    if f.stage in ("sca", "container") and f.package:
        # one dependency upgrade fixes all advisories of that package, across fs and image scans
        return f"pkg:{f.package}"
    if f.is_secret:
        return f"secret:{f.file}"
    if f.stage == "dast":
        return f"dast:{f.rule_id}"
    if f.stage == "iac":
        return f"iac:{f.rule_id}"
    # SAST: same rule in the same file is one fix
    return f"sast:{f.rule_id}:{f.file}"


def build_clusters(findings: list[Finding]) -> list[Cluster]:
    groups: dict[str, list[Finding]] = {}
    for f in findings:
        groups.setdefault(cluster_key(f), []).append(f)
    clusters = []
    for key, fs in groups.items():
        # remove exact duplicates (same fingerprint + line), e.g. a package seen by Trivy fs and npm-audit
        seen, uniq = set(), []
        for f in fs:
            k = (f.fingerprint, f.line) if f.stage not in ("sca", "container") else (",".join(f.vuln_ids) or f.rule_id,)
            if k not in seen:
                seen.add(k)
                uniq.append(f)
        cid = "C" + hashlib.sha256(key.encode()).hexdigest()[:6]
        c = Cluster(cluster_id=cid, key=key, findings=uniq, seen_stages={f.stage for f in fs})
        score_cluster(c)
        clusters.append(c)
    clusters.sort(key=lambda c: (-c.risk_score, c.cluster_id))
    return clusters


def score_cluster(c: Cluster) -> None:
    f = c.representative
    score = SEVERITY_POINTS[f.severity]
    reasons = [f"base {f.severity} = {score}"]
    mult = max(STAGE_CONFIDENCE.get(s, 1.0) for s in c.stages)
    if mult != 1.0:
        reasons.append(f"stage x{mult}")
    score *= mult
    if len(c.stages) > 1:
        score *= 1.15
        reasons.append("confirmed by several stages x1.15")
    if c.cwes & TOP25:
        score += 5
        reasons.append("CWE Top-25 +5")
    if c.fix_available:
        score += 3
        reasons.append("fix available +3")
    n_crit = sum(1 for x in c.findings if x.severity in ("CRITICAL", "HIGH"))
    if n_crit > 1:
        bonus = min(10, 2 * (n_crit - 1))
        score += bonus
        reasons.append(f"{n_crit} high/critical advisories +{bonus}")
    if all(_is_test_path(x.file) for x in c.findings if x.file) and any(x.file for x in c.findings):
        score *= 0.4
        reasons.append("only in test code x0.4")
    low_conf = all(x.confidence.upper() == "LOW" for x in c.findings if x.confidence)
    if low_conf and any(x.confidence for x in c.findings):
        score *= 0.8
        reasons.append("scanner confidence LOW x0.8")
    c.risk_score = round(score, 1)
    c.reasons = reasons
