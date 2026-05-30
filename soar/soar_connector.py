import json, requests, os
from datetime import datetime

SHUFFLE_WEBHOOK = os.getenv("SHUFFLE_WEBHOOK_URL", "http://10.180.251.70:3001/api/v1/hooks/webhook_3711f485-b7b9-4de7-88f1-bcd6bae0eb72")

def parse_sarif(filepath, tool_name):
    findings = []
    try:
        with open(filepath) as f:
            data = json.load(f)
        for run in data.get("runs", []):
            for result in run.get("results", []):
                loc = result.get("locations", [{}])[0]
                phys = loc.get("physicalLocation", {})
                findings.append({
                    "tool": tool_name,
                    "rule_id": result.get("ruleId", "unknown"),
                    "severity": result.get("level", "warning"),
                    "description": result.get("message", {}).get("text", ""),
                    "file": phys.get("artifactLocation", {}).get("uri", ""),
                    "line": phys.get("region", {}).get("startLine", 0),
                    "cve_id": None,
                    "timestamp": datetime.utcnow().isoformat()
                })
    except Exception as e:
        print(f"[WARN] Could not parse {filepath}: {e}")
    return findings

def parse_trivy(filepath):
    findings = []
    try:
        with open(filepath) as f:
            data = json.load(f)
        for result in data.get("Results", []):
            for vuln in result.get("Vulnerabilities", []):
                findings.append({
                    "tool": "trivy",
                    "rule_id": vuln.get("VulnerabilityID", ""),
                    "severity": vuln.get("Severity", "UNKNOWN").lower(),
                    "description": vuln.get("Title", ""),
                    "file": vuln.get("PkgName", ""),
                    "line": 0,
                    "cve_id": vuln.get("VulnerabilityID", ""),
                    "installed_version": vuln.get("InstalledVersion", ""),
                    "fixed_version": vuln.get("FixedVersion", ""),
                    "timestamp": datetime.utcnow().isoformat()
                })
    except Exception as e:
        print(f"[WARN] Could not parse {filepath}: {e}")
    return findings

def parse_zap(filepath):
    findings = []
    risk_map = {"3": "high", "2": "medium", "1": "low", "0": "info"}
    try:
        with open(filepath) as f:
            data = json.load(f)
        for alert in data.get("site", [{}])[0].get("alerts", []):
            findings.append({
                "tool": "zap",
                "rule_id": alert.get("pluginid", ""),
                "severity": risk_map.get(alert.get("riskcode", "1"), "low"),
                "description": alert.get("alert", ""),
                "file": alert.get("uri", ""),
                "line": 0,
                "cve_id": None,
                "cwe_id": alert.get("cweid", ""),
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception as e:
        print(f"[WARN] Could not parse {filepath}: {e}")
    return findings

def post_to_soar(finding):
    try:
        resp = requests.post(SHUFFLE_WEBHOOK, json=finding, timeout=10)
        if resp.status_code == 200:
            print(f"[OK]   Sent: {finding['tool']} | {finding['rule_id']}")
        else:
            print(f"[FAIL] Status {resp.status_code}: {finding['rule_id']}")
    except Exception as e:
        print(f"[ERROR] Could not reach SOAR: {e}")

if __name__ == "__main__":
    all_findings = []
    if os.path.exists("reports/semgrep.sarif"):
        all_findings += parse_sarif("reports/semgrep.sarif", "semgrep")
    if os.path.exists("reports/gitleaks.sarif"):
        all_findings += parse_sarif("reports/gitleaks.sarif", "gitleaks")
    if os.path.exists("reports/trivy.json"):
        all_findings += parse_trivy("reports/trivy.json")
    if os.path.exists("reports/zap.json"):
        all_findings += parse_zap("reports/zap.json")
    print(f"[INFO] Total findings to send: {len(all_findings)}")
    for finding in all_findings:
        post_to_soar(finding)
    print("[DONE] All findings sent to SOAR.")
