"""Output guard: never trust the model's answer without checking it against the evidence.

Checks applied to every triage result:
  * cluster_id must be one we sent (no invented findings)
  * every CVE / GHSA / CWE id the model mentions must exist in that cluster's scanner data;
    unknown ids are removed and the result is flagged `hallucination=True`
  * version numbers in a dependency fix must match what the scanner reported (otherwise
    flagged; the PR drafter additionally confirms the version exists in the npm registry)
  * enums are clamped (verdict, confidence, priority_adjustment in -1..+1)
  * the answer is scanned for secrets; if the model echoes anything secret-looking, the
    text is dropped
A flagged result can still be shown to a human, but it can never trigger an automatic PR.
"""
from __future__ import annotations

import re

from .redact import SECRET_PATTERNS

ID_RE = re.compile(r"\b(CVE-\d{4}-\d{4,}|GHSA(?:-[0-9a-z]{4}){3}|CWE-\d+)\b", re.I)
VERSION_RE = re.compile(r"\b\d+\.\d+(?:\.\d+)?(?:[-+][\w.]+)?\b")
VERDICTS = {"true_positive", "likely_false_positive", "needs_review"}
CONFIDENCE = {"high", "medium", "low"}


def _known_ids(view: dict) -> set[str]:
    return {i.upper() for i in (view.get("vuln_ids") or []) + (view.get("cwe") or [])}


def check_result(result: dict, view: dict) -> tuple[dict, list[str]]:
    issues: list[str] = []
    out = {
        "cluster_id": view["cluster_id"],
        "verdict": str(result.get("verdict", "needs_review")).lower(),
        "confidence": str(result.get("confidence", "low")).lower(),
        "priority_adjustment": result.get("priority_adjustment", 0),
        "rationale": str(result.get("rationale", ""))[:600],
        "fix": str(result.get("fix", ""))[:800],
        "hallucination": False,
    }
    if out["verdict"] not in VERDICTS:
        issues.append(f"invalid verdict {out['verdict']!r}")
        out["verdict"] = "needs_review"
    if out["confidence"] not in CONFIDENCE:
        out["confidence"] = "low"
    try:
        out["priority_adjustment"] = max(-1, min(1, int(out["priority_adjustment"])))
    except (TypeError, ValueError):
        out["priority_adjustment"] = 0

    known = _known_ids(view)
    mentioned = {m.upper() for m in ID_RE.findall(" ".join([out["rationale"], out["fix"]]))}
    mentioned |= {str(i).upper() for i in (result.get("cited_ids") or []) if ID_RE.fullmatch(str(i))}
    unknown = sorted(mentioned - known)
    if unknown:
        out["hallucination"] = True
        issues.append(f"unverified ids {unknown}")
        for bad in unknown:
            out["rationale"] = re.sub(re.escape(bad), "[unverified id removed]", out["rationale"], flags=re.I)
            out["fix"] = re.sub(re.escape(bad), "[unverified id removed]", out["fix"], flags=re.I)

    if view.get("package") and view.get("stage") in ("sca", "container"):
        allowed_versions = {view.get("installed_version", "")} | set(
            re.findall(VERSION_RE, view.get("fixed_version", "") or ""))
        allowed_versions |= set(re.findall(VERSION_RE, view.get("installed_version", "") or ""))
        claimed = set(VERSION_RE.findall(out["fix"]))
        odd = sorted(v for v in claimed if v not in allowed_versions)
        if odd:
            out["hallucination"] = True
            issues.append(f"version(s) not reported by scanner {odd}")

    for name, pat in SECRET_PATTERNS.items():
        if pat.search(out["fix"]) or pat.search(out["rationale"]):
            issues.append(f"model output contained {name}; text dropped")
            out["fix"] = "[removed: output looked like a secret]"
            out["rationale"] = "[removed]"
            out["hallucination"] = True

    lines = [ln for ln in out["fix"].splitlines() if ln.strip()]
    if len(lines) > 5:
        out["fix"] = "\n".join(lines[:5])
    if out["hallucination"]:
        out["confidence"] = "low"
        if out["verdict"] == "true_positive":
            out["verdict"] = "needs_review"
    out["guard_issues"] = issues
    return out, issues


def check_all(results: list[dict], views: list[dict]) -> tuple[list[dict], dict]:
    by_id = {v["cluster_id"]: v for v in views}
    checked, stats = {}, {"unknown_cluster": 0, "hallucinations": 0, "missing": 0, "issues": []}
    for r in results or []:
        cid = r.get("cluster_id")
        if cid not in by_id:
            stats["unknown_cluster"] += 1
            stats["issues"].append(f"model returned unknown cluster {cid!r}")
            continue
        out, issues = check_result(r, by_id[cid])
        if out["hallucination"]:
            stats["hallucinations"] += 1
        stats["issues"].extend(f"{cid}: {i}" for i in issues)
        checked[cid] = out
    for cid, v in by_id.items():
        if cid not in checked:
            stats["missing"] += 1
            checked[cid] = {"cluster_id": cid, "verdict": "needs_review", "confidence": "low",
                            "priority_adjustment": 0, "rationale": "model returned no result for this cluster",
                            "fix": "", "hallucination": False, "guard_issues": ["missing"]}
    return list(checked.values()), stats
