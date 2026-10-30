"""Measure the LLM triage against human ground-truth labels (honest FP / FN analysis).

Confusion matrix, from the point of view of "is this finding real?":
  LLM true_positive          + label real            -> TP  (correctly kept)
  LLM true_positive          + label false_positive  -> FP  (noise passed on to developers)
  LLM likely_false_positive  + label real            -> FN  (DANGEROUS: real issue dismissed)
  LLM likely_false_positive  + label false_positive  -> TN  (noise correctly removed)
  LLM needs_review           -> "deferred" (safe, but costs human time)
The scanner-only baseline treats every finding as real; comparing against it shows whether
the LLM actually reduces noise without dropping real issues.
"""
from __future__ import annotations

import json
from pathlib import Path

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None


def _matches(rule: dict, row: dict) -> bool:
    m = rule.get("match", {})
    if "rule_id" in m and m["rule_id"] not in row["rule_id"]:
        return False
    if "package" in m and m["package"] != row.get("package"):
        return False
    if "file" in m and not any(m["file"] in f for f in row.get("files", [])):
        return False
    if "title" in m and m["title"].lower() not in row["title"].lower():
        return False
    return bool(m)


def evaluate(triage_path: Path, truth_path: Path) -> dict:
    triage = json.loads(Path(triage_path).read_text())
    truth = yaml.safe_load(Path(truth_path).read_text())
    rows = []
    for r in triage["clusters"]:
        v = r["triage"].get("verdict")
        if v not in ("true_positive", "likely_false_positive", "needs_review") or r["triage"].get("handled_locally"):
            continue
        label = next((t for t in truth.get("labels", []) if _matches(t, r)), None)
        if not label:
            continue
        rows.append({"cluster_id": r["cluster_id"], "title": r["title"], "rule_id": r["rule_id"],
                     "package": r.get("package", ""), "label": label["label"], "why": label.get("why", ""),
                     "verdict": v, "hallucination": r["triage"].get("hallucination", False),
                     "rationale": r["triage"].get("rationale", "")})
    cm = {"TP": 0, "FP": 0, "FN": 0, "TN": 0, "deferred_real": 0, "deferred_fp": 0}
    for x in rows:
        real = x["label"] == "real"
        if x["verdict"] == "true_positive":
            x["outcome"] = "TP" if real else "FP"
        elif x["verdict"] == "likely_false_positive":
            x["outcome"] = "FN" if real else "TN"
        else:
            x["outcome"] = "deferred_real" if real else "deferred_fp"
        cm[x["outcome"]] += 1
    decided = cm["TP"] + cm["FP"] + cm["FN"] + cm["TN"]
    n_real = sum(1 for x in rows if x["label"] == "real")
    res = {
        "labelled_clusters": len(rows),
        "confusion": cm,
        "precision": round(cm["TP"] / (cm["TP"] + cm["FP"]), 3) if cm["TP"] + cm["FP"] else None,
        "recall_real_kept": round((cm["TP"] + cm["deferred_real"]) / n_real, 3) if n_real else None,
        "fp_removed_rate": round(cm["TN"] / (cm["TN"] + cm["FP"] + cm["deferred_fp"]), 3)
        if (cm["TN"] + cm["FP"] + cm["deferred_fp"]) else None,
        "deferral_rate": round((cm["deferred_real"] + cm["deferred_fp"]) / len(rows), 3) if rows else None,
        "dangerous_dismissals": [x for x in rows if x["outcome"] == "FN"],
        "scanner_only_precision": round(n_real / len(rows), 3) if rows else None,
        "hallucinations_flagged_by_guard": triage["guard"]["hallucinations"],
        "decided": decided,
        "rows": rows,
    }
    return res


def to_markdown(res: dict) -> str:
    cm = res["confusion"]
    lines = ["## LLM triage evaluation vs. ground truth", "",
             f"Labelled clusters: **{res['labelled_clusters']}**", "",
             "| | Label: real | Label: false positive |", "|---|---|---|",
             f"| LLM: true_positive | TP {cm['TP']} | FP {cm['FP']} |",
             f"| LLM: likely_false_positive | **FN {cm['FN']}** | TN {cm['TN']} |",
             f"| LLM: needs_review | {cm['deferred_real']} | {cm['deferred_fp']} |", "",
             f"- Precision of 'true_positive' verdicts: **{res['precision']}** "
             f"(scanner-only baseline: {res['scanner_only_precision']})",
             f"- Real issues kept (not dismissed): **{res['recall_real_kept']}**",
             f"- False positives removed: **{res['fp_removed_rate']}**",
             f"- Deferred to a human (needs_review): {res['deferral_rate']}",
             f"- Hallucinations caught by the output guard: {res['hallucinations_flagged_by_guard']}", ""]
    if res["dangerous_dismissals"]:
        lines += ["### ⚠️ Real issues the LLM dismissed (false negatives)", ""]
        lines += [f"- `{x['cluster_id']}` {x['title']}: {x['rationale']}" for x in res["dangerous_dismissals"]]
    lines += ["", "| Cluster | Finding | Label | LLM verdict | Outcome |", "|---|---|---|---|---|"]
    for x in res["rows"]:
        lines.append(f"| {x['cluster_id']} | {(x['package'] or x['title'])[:60]} | {x['label']} | {x['verdict']} | {x['outcome']} |")
    return "\n".join(lines) + "\n"
