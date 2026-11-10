
import csv
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent

ALLOWED_REPORTS = (
    "trivy-sca-report.json",
    "trivy-docker-report.json",
)

if len(sys.argv) > 2 or (
    len(sys.argv) == 2 and sys.argv[1] not in ALLOWED_REPORTS
):
    raise SystemExit("Erreur : nom de rapport non autorise")

report_name = sys.argv[1] if len(sys.argv) == 2 else ALLOWED_REPORTS[0]
REPORT = Path.cwd() / report_name if len(sys.argv) == 2 else ROOT / report_name
DOCKER_MODE = report_name == "trivy-docker-report.json"


def key(item):
    return (
        item["target"],
        item["package"],
        item["version"],
        item["vulnerability_id"],
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
    accepted_sca = set()
    accepted_packages = set()

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

        accepted_sca.add(k)
        accepted_packages.add(k[1:])

    findings = set()
    authorized = set()

    for result in report["Results"]:
        for vuln in result.get("Vulnerabilities", []):
            if vuln.get("Severity") not in ("HIGH", "CRITICAL"):
                continue

            finding = (
                result["Target"],
                vuln["PkgName"],
                vuln["InstalledVersion"],
                vuln["VulnerabilityID"],
            )

            findings.add(finding)

            if DOCKER_MODE:
                # Reutiliser les exceptions SCA uniquement
                # pour les dependances applicatives.
                if (
                    result.get("Class") == "lang-pkgs"
                    and finding[1:] in accepted_packages
                ):
                    authorized.add(finding)
            elif finding in accepted_sca:
                authorized.add(finding)

    blocked = findings - authorized

    print("Scan :", "Docker" if DOCKER_MODE else "SCA")
    print("Alertes HIGH/CRITICAL :", len(findings))
    print("Occurrences acceptees :", len(authorized))
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
