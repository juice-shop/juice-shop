#!/usr/bin/env python3
"""Week 1 deliverable: runtime baseline from the passive OWASP ZAP baseline scan.

Turns zap.json (from the pipeline artifact `scan-container-dast`, or a local run) into
security/docs/runtime_baseline.md. Only alert metadata is written: no request/response
evidence, cookies or tokens.

  python3 security/scripts/zap_summary.py path/to/zap.json
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

RISK = {"3": "High", "2": "Medium", "1": "Low", "0": "Informational"}


def main(path: str, out: str = "security/docs/runtime_baseline.md") -> None:
    data = json.loads(Path(path).read_text())
    rows = []
    for site in data.get("site", []):
        for a in site.get("alerts", []):
            rows.append((a.get("riskcode", "0"), a.get("alert", ""), a.get("cweid", ""),
                         a.get("count", str(len(a.get("instances", [])))), a.get("pluginid", "")))
    rows.sort(key=lambda r: -int(r[0]))
    lines = [
        "# Runtime baseline (OWASP ZAP passive baseline scan)", "",
        f"- Target: local kind deployment of Juice Shop (lab only) · ZAP {data.get('@version', '')}",
        f"- Generated: {datetime.now(timezone.utc):%Y-%m-%d %H:%M UTC}",
        "- Mode: passive (spider + passive rules); no attack payloads were sent", "",
        "| Risk | Alert | CWE | Instances | ZAP rule |", "|---|---|---|---|---|",
    ]
    lines += [f"| {RISK.get(str(r[0]), r[0])} | {r[1]} | {('CWE-' + str(r[2])) if r[2] not in ('', '-1', '0') else ''} | {r[3]} | {r[4]} |"
              for r in rows]
    lines += ["", "## Notes (fill in)", "",
              "- Which alerts map to OWASP Top 10 categories, and which Juice Shop code findings (SAST) explain them?",
              "- Which alerts are expected for a lab build (e.g. missing headers) versus real design flaws?", ""]
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_text("\n".join(lines))
    print(f"{len(rows)} alert types -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:])
