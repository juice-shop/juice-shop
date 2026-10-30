"""Command line: python -m pftriage <command> ...

  normalize         scanner JSON files -> normalized.json
  gate              per-stage severity gate against the baseline (exit 1 = block)
  baseline          write / update security/baseline.json from current findings
  triage            cluster + redact + LLM triage -> triage.json, triage.md, llm_audit/
  draft-prs         draft remediation PRs for the top findings (human approval required)
  evaluate          compare triage verdicts with ground-truth labels (FP / FN analysis)
  explain-policies  stretch goal: plain-English explanations of failed Checkov policies
  verify-audit      re-scan every logged LLM payload for secrets / code / identifiers
  models            list models available to your Gemini API key
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from . import evaluate as ev
from .gate import evaluate_gate, gate_markdown, load_baseline, load_policy, make_baseline, write_stage_metrics
from .llm import extract_json, get_provider
from .models import Finding
from .normalize import detect_and_parse, load_dir
from .redact import RedactionConfig, RedactionError, Redactor


def _load_inputs(paths: list[str]) -> list[Finding]:
    findings: list[Finding] = []
    for p in paths:
        p = Path(p)
        if p.is_dir():
            findings.extend(load_dir(p))
        elif p.exists():
            findings.extend(detect_and_parse(p))
        else:
            print(f"[pftriage] input not found, skipping: {p}")
    return findings


def _summary(text: str) -> None:
    print(text)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(text + "\n")


def cmd_normalize(a):
    findings = _load_inputs(a.input)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps([f.to_dict() for f in findings], indent=1))
    print(f"[pftriage] {len(findings)} findings -> {a.out}")


def cmd_gate(a):
    findings = _load_inputs(a.input)
    res = evaluate_gate(findings, a.stage, load_policy(a.policy), load_baseline(a.baseline))
    write_stage_metrics(res, a.tool or a.stage, Path(a.metrics_dir))
    _summary(gate_markdown(res, a.tool or a.stage))
    if res["failed"] and not a.no_fail:
        print(f"[pftriage] {a.stage} gate FAILED: {len(res['violations'])} new finding(s) at or above "
              f"{res['threshold']}", file=sys.stderr)
        sys.exit(1)


def cmd_baseline(a):
    findings = _load_inputs(a.input)
    prev = load_baseline(a.out) if a.merge else None
    base = make_baseline(findings, prev)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(base, indent=1) + "\n")
    print(f"[pftriage] baseline with {sum(base['counts'].values())} findings across stages {base['stages']} -> {a.out}")


def cmd_triage(a):
    from .triage import triage
    findings = _load_inputs(a.input)
    if a.stages:
        findings = [f for f in findings if f.stage in a.stages.split(",")]
    provider = get_provider(a.provider, a.model)
    res = triage(findings, provider, Path(a.out), RedactionConfig.load(a.redaction),
                 max_clusters=a.max_clusters, batch_size=a.batch_size)
    _summary((Path(a.out) / "triage.md").read_text())
    c = res["counts"]
    print(f"[pftriage] {c['findings']} findings, {c['clusters']} clusters, {c['sent_to_llm']} sent to "
          f"{res['provider']}, {res['llm_calls']} LLM call(s), guard flagged {res['guard']['hallucinations']}")
    if res["errors"]:
        print("[pftriage] errors: " + "; ".join(res["errors"]), file=sys.stderr)


def cmd_draft_prs(a):
    from .prs import draft_prs
    provider = get_provider(a.provider, a.model)
    res = draft_prs(Path(a.triage), Path(a.repo), provider, RedactionConfig.load(a.redaction), Path(a.out),
                    top=a.top, open_prs=a.open, base=a.base)
    for r in res:
        print(f"[pftriage] {r['cluster_id']} ({r['kind']}): {r['status']} {r.get('reason', '')} {r.get('pr', '')}")
        for c in r.get("checks", []):
            print("    " + c)


def cmd_evaluate(a):
    res = ev.evaluate(Path(a.triage), Path(a.truth))
    md = ev.to_markdown(res)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(md)
    Path(a.out).with_suffix(".json").write_text(json.dumps(res, indent=1))
    _summary(md)


def cmd_explain(a):
    from .triage import AuditLog, load_prompt
    data = json.loads(Path(a.triage).read_text())
    red = Redactor(RedactionConfig.load(a.redaction))
    pols = [{"rule_id": r["rule_id"], "name": red.scrub(r["title"]), "count": r["count"]}
            for r in data["clusters"] if "iac" in r["stages"]][: a.limit]
    if not pols:
        print("[pftriage] no failed policies")
        return
    provider = get_provider(a.provider, a.model)
    payload = red.safe_payload({"policies": pols})
    system = load_prompt("policy_explain_system.md")
    resp = provider.complete(system, payload, max_tokens=4000)
    AuditLog(Path(a.out)).record("explain_policies", system, payload, resp, {"provider": provider.name})
    known = {p["rule_id"] for p in pols}
    try:
        results = [r for r in extract_json(resp).get("results", []) if r.get("rule_id") in known]
    except Exception:  # noqa: BLE001 - offline provider returns no explanations
        results = []
    md = ["## 🤖 Policy bot: why these IaC checks failed", ""]
    if not results:
        md.append("_No explanations (offline mode or model returned none)._")
    md += [f"**`{r['rule_id']}`**: {r.get('explanation', '')}\n" for r in results]
    Path(a.out).mkdir(parents=True, exist_ok=True)
    (Path(a.out) / "policy_explanations.md").write_text("\n".join(md) + "\n")
    _summary("\n".join(md))


def cmd_verify_audit(a):
    red = Redactor(RedactionConfig.load(a.redaction))
    files = sorted(Path(a.dir).glob("*.json"))
    bad = 0
    for f in files:
        entry = json.loads(f.read_text())
        try:
            red.verify(entry["user_payload"])
            if a.check_code and any(tok in entry["user_payload"] for tok in ("require(", "=> {", "function(", "SELECT * FROM")):
                raise RedactionError("code fragment present")
        except RedactionError as e:
            bad += 1
            print(f"[verify-audit] {f.name}: {e}")
    _summary(f"### 🔒 Redaction audit: {len(files)} outbound LLM payload(s) re-scanned, {bad} problem(s)\n")
    if bad:
        sys.exit(1)


def cmd_models(a):
    import urllib.request
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        sys.exit("set GEMINI_API_KEY first")
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
                                 headers={"x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    for m in data.get("models", []):
        if "generateContent" in m.get("supportedGenerationMethods", []):
            print(m["name"].removeprefix("models/"))


def main(argv=None):
    p = argparse.ArgumentParser(prog="pftriage", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    red_default = os.environ.get("PF_REDACTION_CONFIG", "security/redaction.yaml")

    s = sub.add_parser("normalize"); s.add_argument("--input", nargs="+", required=True); s.add_argument("--out", default="triage-out/normalized.json"); s.set_defaults(fn=cmd_normalize)

    s = sub.add_parser("gate")
    s.add_argument("--stage", required=True, choices=["secrets", "sast", "sca", "iac", "container", "dast"])
    s.add_argument("--input", nargs="+", required=True)
    s.add_argument("--tool", default="")
    s.add_argument("--policy", default="security/policy.yaml")
    s.add_argument("--baseline", default="security/baseline.json")
    s.add_argument("--metrics-dir", default="metrics-out")
    s.add_argument("--no-fail", action="store_true", help="report only, never exit 1")
    s.set_defaults(fn=cmd_gate)

    s = sub.add_parser("baseline"); s.add_argument("--input", nargs="+", required=True)
    s.add_argument("--out", default="security/baseline.json"); s.add_argument("--merge", action="store_true")
    s.set_defaults(fn=cmd_baseline)

    s = sub.add_parser("triage"); s.add_argument("--input", nargs="+", required=True)
    s.add_argument("--out", default="triage-out"); s.add_argument("--provider"); s.add_argument("--model")
    s.add_argument("--redaction", default=red_default); s.add_argument("--max-clusters", type=int, default=60)
    s.add_argument("--batch-size", type=int, default=20); s.add_argument("--stages", default="")
    s.set_defaults(fn=cmd_triage)

    s = sub.add_parser("draft-prs"); s.add_argument("--triage", default="triage-out/triage.json")
    s.add_argument("--repo", default="."); s.add_argument("--top", type=int, default=2)
    s.add_argument("--open", action="store_true", help="push branches and open draft PRs (needs gh)")
    s.add_argument("--base", default="main"); s.add_argument("--out", default="triage-out")
    s.add_argument("--provider"); s.add_argument("--model"); s.add_argument("--redaction", default=red_default)
    s.set_defaults(fn=cmd_draft_prs)

    s = sub.add_parser("evaluate"); s.add_argument("--triage", default="triage-out/triage.json")
    s.add_argument("--truth", default="security/ground_truth.yaml"); s.add_argument("--out", default="triage-out/evaluation.md")
    s.set_defaults(fn=cmd_evaluate)

    s = sub.add_parser("explain-policies"); s.add_argument("--triage", default="triage-out/triage.json")
    s.add_argument("--out", default="triage-out"); s.add_argument("--limit", type=int, default=8)
    s.add_argument("--provider"); s.add_argument("--model"); s.add_argument("--redaction", default=red_default)
    s.set_defaults(fn=cmd_explain)

    s = sub.add_parser("verify-audit"); s.add_argument("--dir", default="triage-out/llm_audit")
    s.add_argument("--redaction", default=red_default); s.add_argument("--check-code", action="store_true", default=True)
    s.set_defaults(fn=cmd_verify_audit)

    s = sub.add_parser("models"); s.set_defaults(fn=cmd_models)

    a = p.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
