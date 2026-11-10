
import csv
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Classification définie pour notre projet
HIGH_RULES = {"CKV2_GHA_1", "CKV_DOCKER_3"}
CRITICAL_RULES = set()

try:
    with open(ROOT / "checkov-baseline.json", encoding="utf-8") as f:
        baseline = json.load(f)

    with open(ROOT / "checkov-exceptions.csv", encoding="utf-8-sig", newline="") as f:
        exceptions = list(csv.DictReader(f))

    report_path = Path("checkov-reports/checkov-report.json/results_json.json")
    with open(report_path, encoding="utf-8") as f:
        report = json.load(f)

    def failures(data):
        if not isinstance(data, list):
            raise ValueError("Format de rapport Checkov invalide")
        return {
            (item["check_id"], item["file_path"])
            for section in data
            for item in section["results"]["failed_checks"]
        }

    baseline_findings = failures(baseline)
    current_findings = failures(report)

    approved = set()

    for row in exceptions:
        if row["decision"].strip().lower() != "accepted":
            continue

        finding = (row["check_id"], row["file_path"])

        if finding not in baseline_findings:
            raise ValueError("Exception absente de la baseline")

        if not row["justification"].strip() or not row["mitigation"].strip():
            raise ValueError("Exception sans justification ou mitigation")

        if date.fromisoformat(row["review_date"]) < date.today():
            raise ValueError("Exception expiree")

        approved.add(finding)

    blocking_rules = HIGH_RULES | CRITICAL_RULES

    blocked = sorted(
        finding
        for finding in current_findings
        if finding[0] in blocking_rules and finding not in approved
    )

    print("Scan : IaC Checkov")
    print("Alertes HIGH/CRITICAL :", sum(
        1 for finding in current_findings if finding[0] in blocking_rules
    ))
    print("Exceptions approuvees :", len(current_findings & approved))
    print("Alertes bloquantes :", len(blocked))

    for check_id, file_path in blocked:
        print(f"BLOCKED: {check_id} | {file_path}")

    if blocked:
        sys.exit("QUALITY GATE FAILED")

    print("QUALITY GATE PASSED")

except (OSError, ValueError, KeyError, TypeError) as error:
    sys.exit(f"QUALITY GATE ERROR: {error}")
