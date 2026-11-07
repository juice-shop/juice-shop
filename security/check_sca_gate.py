
import csv
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPORT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "trivy-sca-report.json"

def key(item):
    return (
        item["target"],
        item["package"],
        item["version"],
        item["vulnerability_id"]
    )

try:
    with open(ROOT / "trivy-sca-baseline.json", encoding="utf-8") as f:
        baseline = json.load(f)

    with open(ROOT / "security-exceptions.csv", encoding="utf-8-sig", newline="") as f:
        decisions = list(csv.DictReader(f))

    with open(REPORT, encoding="utf-8") as f:
        report = json.load(f)

    if not report.get("Results"):
        raise ValueError("Rapport Trivy vide ou sans resultats")

    baseline_keys = {key(v) for v in baseline}
    accepted = set()

    for row in decisions:
        if row["decision"].strip() != "accepted":
            continue

        k = key(row)

        if k not in baseline_keys:
            raise ValueError("Exception inconnue dans le registre")

        if not row["justification"].strip() or not row["mitigation"].strip():
            raise ValueError("Exception sans justification ou mitigation")

        expiry = date.fromisoformat(row["review_date"].strip())
        if expiry < date.today():
            raise ValueError("Exception expiree")

        accepted.add(k)

    findings = set()

    for result in report["Results"]:
        for vuln in result.get("Vulnerabilities", []):
            if vuln.get("Severity") not in ("HIGH", "CRITICAL"):
                continue

            findings.add((
                result["Target"],
                vuln["PkgName"],
                vuln["InstalledVersion"],
                vuln["VulnerabilityID"]
            ))

    blocked = findings - accepted

    print("Alertes HIGH/CRITICAL :", len(findings))
    print("Occurrences acceptees :", len(findings & accepted))
    print("Occurrences bloquantes :", len(blocked))

    for target, package, version, cve in sorted(blocked):
        print(f"BLOCKED: {target} | {package}@{version} | {cve}")

    if blocked:
        print("QUALITY GATE FAILED")
        sys.exit(1)

    print("QUALITY GATE PASSED")

except (OSError, ValueError, KeyError, TypeError) as error:
    print("QUALITY GATE ERROR:", error)
    sys.exit(1)
