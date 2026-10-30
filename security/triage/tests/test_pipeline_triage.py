import json

import pytest

from pftriage.cluster import build_clusters
from pftriage.evaluate import evaluate
from pftriage.gate import evaluate_gate, load_policy, make_baseline
from pftriage.guard import check_all, check_result
from pftriage.llm import OfflineProvider, Provider
from pftriage.models import Finding
from pftriage.normalize import load_dir
from pftriage.redact import RedactionConfig, RedactionError, Redactor
from pftriage.triage import triage


# ----------------------------------------------------------------------------- normalize
def test_parsers_detect_every_scanner(scans):
    findings = load_dir(scans)
    assert {f.tool for f in findings} == {"semgrep", "gitleaks", "trivy", "checkov", "zap"}
    assert {f.stage for f in findings} == {"sast", "secrets", "sca", "container", "iac", "dast"}


def test_parsers_never_copy_secret_values(scans, canaries):
    blob = json.dumps([f.to_dict() for f in load_dir(scans)])
    for name in ("pem", "jwt", "url_cred", "email", "password"):
        assert canaries[name] not in blob, f"{name} copied into a Finding"
    assert "Jane Doe" not in blob            # gitleaks author
    assert "SELECT * FROM" not in blob       # semgrep code snippet


# ----------------------------------------------------------------------------- clustering
def test_same_package_from_fs_and_image_is_one_cluster(scans):
    clusters = build_clusters(load_dir(scans))
    lodash = [c for c in clusters if c.key == "pkg:lodash"]
    assert len(lodash) == 1
    assert lodash[0].stages == ["container", "sca"]
    assert lodash[0].vuln_ids == {"CVE-2021-23337", "CVE-2020-8203"}


def test_test_code_is_scored_lower(scans):
    clusters = {c.representative.file: c for c in build_clusters(load_dir(scans)) if c.stages == ["sast"]}
    assert clusters["test/api/searchApiSpec.ts"].risk_score < clusters["routes/search.ts"].risk_score


# ----------------------------------------------------------------------------- redaction
class SpyProvider(Provider):
    """Records exactly what would have been sent over the network."""
    name = "spy"

    def __init__(self):
        super().__init__("spy-model")
        self.sent = []

    def complete(self, system, user, max_tokens=4000):
        self.sent.append(system + user)
        return OfflineProvider().complete(system, user)


def test_no_canary_ever_reaches_the_llm(scans, canaries, tmp_path):
    spy = SpyProvider()
    cfg = RedactionConfig(identifiers=["juice-shop", "Juice Shop", "bkimminich"])
    triage(load_dir(scans), spy, tmp_path / "out", cfg)
    assert spy.sent, "nothing was sent"
    wire = "\n".join(spy.sent)
    for name, value in canaries.items():
        assert value not in wire, f"canary {name} leaked"
        # also no fragment of the secret long enough to be useful
        if len(value) > 20:
            assert value[4:20] not in wire, f"fragment of {name} leaked"
    for real in ("routes/search.ts", "lib/insecurity.ts", "security/k8s/deployment.yaml"):
        assert real not in wire, f"real path {real} leaked"
    assert "juice-shop" not in wire.lower()


def test_secret_clusters_are_never_sent(scans, tmp_path):
    spy = SpyProvider()
    res = triage(load_dir(scans), spy, tmp_path / "out", RedactionConfig())
    secret_rows = [r for r in res["clusters"] if r["is_secret"]]
    assert secret_rows and all(r["triage"].get("handled_locally") for r in secret_rows)
    wire = "\n".join(spy.sent)
    for r in secret_rows:
        assert r["cluster_id"] not in wire


def test_verify_fails_closed(canaries):
    red = Redactor()
    for name in ("aws", "github", "google", "stripe", "anthropic", "jwt", "pem", "entropy", "email"):
        with pytest.raises(RedactionError):
            red.verify(json.dumps({"title": "x " + canaries[name]}))


def test_scrub_removes_code_and_secrets(canaries):
    red = Redactor()
    out = red.scrub(f"Use of `eval(req.body.x)` here\nconst q = db.query(`SELECT * FROM users`);\nkey {canaries['aws']}")
    assert "eval(" not in out and "SELECT" not in out and canaries["aws"] not in out


def test_config_context_refuses_source_files():
    red = Redactor()
    with pytest.raises(RedactionError):
        red.config_context("routes/login.ts", "const x = 1")
    with pytest.raises(RedactionError):
        red.config_context("encryptionkeys/jwt.pub", "x")
    assert "image:" in red.config_context("security/k8s/deployment.yaml", "image: foo")


def test_cve_ids_and_owasp_links_are_not_false_redactions():
    red = Redactor()
    s = red.scrub("CVE-2021-23337 GHSA-35jh-r3h4-6jhm CWE-1321 see https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html")
    assert "CVE-2021-23337" in s and "GHSA-35jh-r3h4-6jhm" in s and "Secrets_Management_Cheat_Sheet" in s


# ----------------------------------------------------------------------------- output guard
VIEW = {"cluster_id": "C1", "stage": "sca", "package": "lodash", "installed_version": "2.4.2",
        "fixed_version": "4.17.21", "vuln_ids": ["CVE-2021-23337"], "cwe": ["CWE-77"]}


def test_guard_flags_invented_cve():
    out, issues = check_result({"cluster_id": "C1", "verdict": "true_positive", "confidence": "high",
                                "fix": "Upgrade lodash to 4.17.21 (fixes CVE-2021-23337 and CVE-2099-0001)"}, VIEW)
    assert out["hallucination"] and "CVE-2099-0001" not in out["fix"]
    assert out["verdict"] == "needs_review" and out["confidence"] == "low"


def test_guard_flags_invented_version():
    out, _ = check_result({"cluster_id": "C1", "verdict": "true_positive", "fix": "Upgrade lodash to 4.17.99"}, VIEW)
    assert out["hallucination"]


def test_guard_accepts_grounded_answer():
    out, issues = check_result({"cluster_id": "C1", "verdict": "true_positive", "confidence": "high",
                                "priority_adjustment": 5, "fix": "Upgrade lodash from 2.4.2 to 4.17.21.",
                                "cited_ids": ["CVE-2021-23337"]}, VIEW)
    assert not out["hallucination"] and out["verdict"] == "true_positive" and out["priority_adjustment"] == 1


def test_guard_drops_unknown_clusters_and_secret_echo(canaries):
    results, stats = check_all([{"cluster_id": "C999", "verdict": "true_positive"},
                                {"cluster_id": "C1", "verdict": "true_positive", "fix": "use " + canaries["github"]}],
                               [VIEW])
    assert stats["unknown_cluster"] == 1
    assert canaries["github"] not in json.dumps(results)


# ----------------------------------------------------------------------------- gates
def _f(sev="HIGH", rule="r1", file="a.ts", stage="sast", fixed=""):
    return Finding(tool="semgrep", stage=stage, rule_id=rule, title="t", severity=sev, file=file, fixed_version=fixed)


def test_gate_is_report_only_without_baseline():
    res = evaluate_gate([_f()], "sast", load_policy(None), None)
    assert not res["failed"] and res["status"].startswith("report-only")


def test_gate_blocks_only_new_findings():
    base = make_baseline([_f()])
    assert not evaluate_gate([_f()], "sast", load_policy(None), base)["failed"]
    res = evaluate_gate([_f(), _f()], "sast", load_policy(None), base)  # second instance = new
    assert res["failed"] and len(res["violations"]) == 1
    assert not evaluate_gate([_f(sev="MEDIUM", rule="r2")], "sast", load_policy(None), base)["failed"]


def test_sca_gate_ignores_unfixable():
    base = make_baseline([_f(stage="sca", rule="CVE-1")])
    pol = load_policy(None)
    assert not evaluate_gate([_f(stage="sca", rule="CVE-2", sev="CRITICAL")], "sca", pol, base)["failed"]
    assert evaluate_gate([_f(stage="sca", rule="CVE-3", sev="CRITICAL", fixed="1.2.3")], "sca", pol, base)["failed"]


# ----------------------------------------------------------------------------- evaluation
def test_evaluate_confusion_matrix(tmp_path):
    tri = {"guard": {"hallucinations": 0}, "clusters": [
        {"cluster_id": "A", "rule_id": "x", "title": "t", "package": "lodash", "files": [], "triage": {"verdict": "true_positive"}},
        {"cluster_id": "B", "rule_id": "y", "title": "t", "package": "", "files": ["test/a.ts"], "triage": {"verdict": "likely_false_positive"}},
        {"cluster_id": "C", "rule_id": "z", "title": "t", "package": "", "files": ["routes/a.ts"], "triage": {"verdict": "likely_false_positive"}},
    ]}
    (tmp_path / "t.json").write_text(json.dumps(tri))
    (tmp_path / "g.yaml").write_text("labels:\n- {match: {package: lodash}, label: real}\n"
                                     "- {match: {rule_id: y}, label: false_positive}\n- {match: {rule_id: z}, label: real}\n")
    res = evaluate(tmp_path / "t.json", tmp_path / "g.yaml")
    assert res["confusion"]["TP"] == 1 and res["confusion"]["TN"] == 1 and res["confusion"]["FN"] == 1
    assert res["dangerous_dismissals"][0]["cluster_id"] == "C"


# ----------------------------------------------------------------------------- later additions
def test_injection_cwes_block_at_any_severity():
    pol = load_policy(None)
    pol["block_cwes"] = ["CWE-79"]
    base = make_baseline([])
    base["stages"] = ["sast"]
    xss = Finding(tool="semgrep", stage="sast", rule_id="xss", title="t", severity="MEDIUM", file="a.ts", cwe=["CWE-79"])
    assert evaluate_gate([xss], "sast", pol, base)["failed"]


def test_identifier_variants_are_redacted_and_reversible():
    red = Redactor(RedactionConfig(identifiers=["juice-shop"]))
    out = red.config_context("security/k8s/deployment.yaml", "name: juice_shop\nimage: Juice Shop\nns: juiceshop")
    assert "juice" not in out.lower()
    assert red.restore_config(out + "\n") == "name: juice_shop\nimage: Juice Shop\nns: juiceshop\n"


def test_restore_config_refuses_edited_secret_lines(canaries):
    red = Redactor()
    sent = red.config_context("security/k8s/deployment.yaml", f"a: 1\ntoken: {canaries['github']}\n")
    assert canaries["github"] not in sent
    assert canaries["github"] in red.restore_config(sent.replace("a: 1", "a: 2"))   # untouched secret line restored
    with pytest.raises(RedactionError):
        red.restore_config(sent.replace("[REDACTED", "x: 1 [REDACTED"))              # model edited the secret line


def test_smallest_safe_fixed_version():
    from pftriage.prs import _min_fixed
    assert _min_fixed(["4.17.21, 5.0.0"], "4.17.15") == "4.17.21"
    assert _min_fixed(["1.2.3"], "2.0.0") is None
