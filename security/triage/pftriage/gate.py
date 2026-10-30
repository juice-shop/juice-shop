"""Severity gates with a baseline ("ratchet").

Juice Shop is intentionally full of vulnerabilities, and so is most legacy code. A gate that
fails on *every* existing finding blocks every release, which is exactly the problem the CISO
wants solved. So the gate fails only on NEW findings above a per-stage threshold. Existing
findings are recorded in a committed baseline file (a risk register that is reviewed and
burned down over time, never silently grown).

A finding is "new" when the count of its fingerprint (tool + rule + file + package + ids,
deliberately without the line number) is higher than in the baseline.
"""
from __future__ import annotations

import json
import os
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from .models import SEVERITIES, Finding, at_least

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None

DEFAULT_POLICY = {
    "thresholds": {"secrets": "LOW", "sast": "HIGH", "sca": "CRITICAL", "container": "CRITICAL",
                   "iac": "HIGH", "dast": "HIGH"},
    "blocking_stages": ["secrets", "sast", "sca", "container", "iac"],
    "only_fixable": ["sca", "container"],
    "block_cwes": [],
}


def load_policy(path: str | None) -> dict:
    pol = json.loads(json.dumps(DEFAULT_POLICY))
    if path and Path(path).exists() and yaml:
        user = yaml.safe_load(Path(path).read_text()) or {}
        for k, v in user.items():
            if isinstance(v, dict) and isinstance(pol.get(k), dict):
                pol[k].update(v)
            else:
                pol[k] = v
    return pol


def load_baseline(path: str | None) -> dict | None:
    if not path or not Path(path).exists():
        return None
    return json.loads(Path(path).read_text())


def make_baseline(findings: list[Finding], previous: dict | None = None) -> dict:
    counts = Counter(f.fingerprint for f in findings)
    meta = {}
    for f in findings:
        meta.setdefault(f.fingerprint, {"stage": f.stage, "tool": f.tool, "rule_id": f.rule_id, "file": f.file,
                                        "package": f.package, "severity": f.severity})
    stages = sorted({f.stage for f in findings} | set((previous or {}).get("stages", [])))
    if previous:  # keep entries of stages not present in this run
        for fp, m in previous.get("meta", {}).items():
            if m["stage"] not in {f.stage for f in findings}:
                counts[fp] = previous["counts"].get(fp, 0)
                meta[fp] = m
    return {"version": 1, "created": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "stages": stages, "counts": dict(sorted(counts.items())), "meta": dict(sorted(meta.items()))}


def blocks(f: Finding, policy: dict) -> bool:
    """Would this finding break its stage gate if it were new?"""
    if f.stage not in policy.get("blocking_stages", []) and f.stage not in policy["thresholds"]:
        return False
    if set(policy.get("block_cwes") or []) & set(f.cwe) and f.stage in ("sast", "dast"):
        return True        # injection classes block at any severity
    if not at_least(f.severity, policy["thresholds"].get(f.stage, "HIGH")):
        return False
    if f.stage in policy.get("only_fixable", []) and not f.fixed_version:
        return False
    return True


def evaluate_gate(findings: list[Finding], stage: str, policy: dict, baseline: dict | None) -> dict:
    threshold = policy["thresholds"].get(stage, "HIGH")
    blocking = stage in policy.get("blocking_stages", [])
    stage_findings = [f for f in findings if f.stage == stage]

    have_baseline = baseline is not None and stage in baseline.get("stages", [])
    base_counts = Counter(baseline.get("counts", {})) if have_baseline else Counter()
    seen = Counter()
    new: list[Finding] = []
    for f in stage_findings:
        seen[f.fingerprint] += 1
        if seen[f.fingerprint] > base_counts.get(f.fingerprint, 0):
            new.append(f)

    def gating(f: Finding) -> bool:
        return blocks(f, policy)

    violations = [f for f in new if gating(f)] if have_baseline else []
    would_violate = [f for f in stage_findings if gating(f)]
    if not have_baseline:
        status = "report-only (no baseline yet)"
        failed = False
    elif violations and blocking:
        status, failed = "FAILED", True
    elif violations:
        status, failed = "warn (stage is non-blocking)", False
    else:
        status, failed = "passed", False
    sev = Counter(f.severity for f in stage_findings)
    return {
        "stage": stage, "threshold": threshold, "blocking": blocking, "status": status, "failed": failed,
        "total": len(stage_findings), "new": len(new) if have_baseline else None,
        "violations": [v.to_dict() for v in violations],
        "at_or_above_threshold": len(would_violate),
        "by_severity": {s: sev.get(s, 0) for s in SEVERITIES},
    }


def write_stage_metrics(result: dict, tool: str, out_dir: Path) -> Path:
    start = float(os.environ.get("PF_STAGE_START", "0") or 0)
    now = time.time()
    m = {
        "stage": result["stage"], "tool": tool, "status": result["status"], "failed": result["failed"],
        "total": result["total"], "new": result["new"], "violations": len(result["violations"]),
        "by_severity": result["by_severity"],
        "duration_s": round(now - start, 1) if start else None,
        "finished": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "run_id": os.environ.get("GITHUB_RUN_ID", "local"), "sha": os.environ.get("GITHUB_SHA", "")[:8],
        "event": os.environ.get("GITHUB_EVENT_NAME", "local"),
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    p = out_dir / f"stage-{result['stage']}.json"
    p.write_text(json.dumps(m, indent=2))
    return p


def gate_markdown(result: dict, tool: str) -> str:
    icon = {"FAILED": "❌", "passed": "✅"}.get(result["status"], "⚠️")
    lines = [f"### {icon} {result['stage'].upper()} gate ({tool}): {result['status']}",
             f"Threshold: **{result['threshold']}** and above, new findings only. "
             f"Total findings: {result['total']}, new: {result['new'] if result['new'] is not None else 'n/a'}.",
             "", "| Severity | Count |", "|---|---|"]
    lines += [f"| {s} | {c} |" for s, c in result["by_severity"].items() if c]
    if result["violations"]:
        lines += ["", "**New findings that break the gate:**", "", "| Severity | Rule | Location |", "|---|---|---|"]
        for v in result["violations"][:25]:
            loc = v["package"] + (f" {v['installed_version']} → {v['fixed_version']}" if v["package"] else "")
            loc = loc or f"{v['file']}:{v['line']}"
            lines.append(f"| {v['severity']} | `{v['rule_id']}` | {loc} |")
    if result["status"].startswith("report-only"):
        lines += ["", "_No baseline for this stage yet. Run `pftriage baseline` and commit "
                      "`security/baseline.json` to start enforcing._"]
    return "\n".join(lines) + "\n"
