"""Shared fixtures.

Canary secrets are generated at run time, never committed, so the repository's own gitleaks
scan stays clean and every test run uses fresh values.
"""
import json
import random
import string
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

_rng = random.SystemRandom()


def _rand(chars, n):
    return "".join(_rng.choice(chars) for _ in range(n))


@pytest.fixture
def canaries():
    """Fake credentials in the formats the redaction layer must catch."""
    b62 = string.ascii_letters + string.digits
    return {
        "aws": "AKIA" + _rand(string.ascii_uppercase + "234567", 16),
        "github": "ghp_" + _rand(b62, 36),
        "google": "AIza" + _rand(b62 + "-_", 35),
        "jwt": "eyJ" + _rand(b62, 20) + "." + _rand(b62, 30) + "." + _rand(b62 + "-_", 30),
        "stripe": "sk_live_" + _rand(b62, 24),
        "anthropic": "sk-ant-" + _rand(b62, 40),
        "pem": "-----BEGIN RSA PRIVATE KEY-----\nMIIEow" + _rand(b62, 60) + "\n-----END RSA PRIVATE KEY-----",
        "password": "db_password = 'Pw" + _rand(b62, 14) + "'",
        "entropy": _rand(string.ascii_uppercase, 6) + _rand(string.digits, 6) + _rand(b62, 28),
        "email": "jane.doe@" + _rand(string.ascii_lowercase, 8) + ".com",
        "url_cred": "postgres://admin:" + _rand(b62, 12) + "@db" + _rand(string.digits, 3) + ".corp:5432/app",
    }


@pytest.fixture
def scans(tmp_path, canaries):
    """A scan directory where every free-text field is poisoned with canaries."""
    c = canaries
    d = tmp_path / "scans"
    d.mkdir()
    semgrep = {"version": "1.182.1", "errors": [], "results": [
        {"check_id": "javascript.sequelize.security.audit.sequelize-raw-query", "path": "routes/search.ts",
         "start": {"line": 23}, "end": {"line": 23},
         "extra": {"severity": "WARNING", "lines": f"models.sequelize.query(`SELECT * FROM Products WHERE name LIKE '%${{criteria}}%'`) // {c['aws']}",
                   "message": f"Untrusted input concatenated with raw SQL. `query(sql)` key={c['github']}",
                   "metadata": {"cwe": ["CWE-89: SQL Injection"], "confidence": "HIGH",
                                "references": ["https://cheatsheetseries.owasp.org/"]}}},
        {"check_id": "javascript.lang.security.audit.code-string-concat", "path": "test/api/searchApiSpec.ts",
         "start": {"line": 5}, "end": {"line": 5},
         "extra": {"severity": "ERROR", "lines": "eval(x)", "message": "eval with user data",
                   "metadata": {"cwe": ["CWE-95"], "confidence": "LOW"}}},
    ]}
    gitleaks = [{"Description": "AWS Access Key", "StartLine": 3, "EndLine": 3, "Match": f"key = {c['aws']}",
                 "Secret": c["aws"], "File": "lib/insecurity.ts", "Commit": "abc123", "Author": "Jane Doe",
                 "Email": c["email"], "RuleID": "aws-access-token", "Fingerprint": "abc123:lib/insecurity.ts:aws:3"}]
    trivy_fs = {"SchemaVersion": 2, "ArtifactName": ".", "ArtifactType": "filesystem", "Results": [
        {"Target": "package-lock.json", "Class": "lang-pkgs", "Type": "npm", "Vulnerabilities": [
            {"VulnerabilityID": "CVE-2021-23337", "PkgName": "lodash", "InstalledVersion": "2.4.2",
             "FixedVersion": "4.17.21", "Severity": "HIGH", "Title": f"lodash: command injection {c['stripe']}",
             "Description": c["pem"], "CweIDs": ["CWE-77", "CWE-94"], "PrimaryURL": "https://avd.aquasec.com/nvd/cve-2021-23337"},
            {"VulnerabilityID": "CVE-2020-8203", "PkgName": "lodash", "InstalledVersion": "2.4.2",
             "FixedVersion": "4.17.19", "Severity": "HIGH", "Title": "lodash: prototype pollution", "CweIDs": ["CWE-1321"]},
            {"VulnerabilityID": "CVE-2022-23539", "PkgName": "jsonwebtoken", "InstalledVersion": "0.4.0",
             "FixedVersion": "9.0.0", "Severity": "CRITICAL", "Title": "jsonwebtoken: insecure key types"},
        ]}]}
    trivy_img = {"SchemaVersion": 2, "ArtifactName": "pipelinefortress/juice-shop:ci", "ArtifactType": "container_image",
                 "Results": [
                     {"Target": "Node.js", "Class": "lang-pkgs", "Type": "node-pkg", "Vulnerabilities": [
                         {"VulnerabilityID": "CVE-2021-23337", "PkgName": "lodash", "InstalledVersion": "2.4.2",
                          "FixedVersion": "4.17.21", "Severity": "HIGH", "Title": "lodash: command injection"}]},
                     {"Target": "/juice-shop/lib/insecurity.ts", "Class": "secret", "Secrets": [
                         {"RuleID": "private-key", "Category": "AsymmetricPrivateKey", "Severity": "HIGH",
                          "Title": "Asymmetric Private Key", "StartLine": 23, "Match": c["pem"],
                          "Code": {"Lines": [{"Content": c["pem"]}]}}]},
                 ]}
    checkov = [{"check_type": "kubernetes", "results": {"failed_checks": [
        {"check_id": "CKV_K8S_43", "check_name": "Image should use digest", "file_path": "/security/k8s/deployment.yaml",
         "file_line_range": [1, 60], "resource": "Deployment.juice-shop.juice-shop", "severity": None,
         "code_block": [[10, f"  password: {c['password']}"]], "guideline": "https://docs.prismacloud.io/x"}]},
                "summary": {"passed": 10, "failed": 1}}]
    zap = {"@programName": "ZAP", "@version": "2.17.0", "site": [{"@name": "http://localhost:3000", "alerts": [
        {"pluginid": "10038", "alert": "Content Security Policy (CSP) Header Not Set", "riskcode": "2",
         "confidence": "3", "cweid": "693", "desc": "<p>CSP missing</p>",
         "instances": [{"uri": f"http://localhost:3000/rest/user/login?token={c['jwt']}", "method": "GET",
                        "evidence": f"Authorization: Bearer {c['jwt']}", "otherinfo": c["url_cred"]}]}]}]}
    for name, data in [("semgrep.json", semgrep), ("gitleaks.json", gitleaks), ("trivy-fs.json", trivy_fs),
                       ("trivy-image.json", trivy_img), ("checkov.json", checkov), ("zap.json", zap)]:
        (d / name).write_text(json.dumps(data))
    return d
