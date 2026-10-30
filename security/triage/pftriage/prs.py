"""Draft remediation Pull Requests for the top findings. A human must approve every one.

Only two kinds of findings are eligible, by design:
  * dependency   - a vulnerable npm package (SCA). The LLM sees the advisory metadata and the
                   scrubbed `dependencies` block of package.json, never application code.
  * config       - a failed Checkov policy in a Kubernetes manifest or Dockerfile. The LLM sees
                   the scrubbed config file (configuration is not application source).
SAST findings (code-level bugs) are NOT auto-fixed: fixing them would require sending source
code to the LLM, which the redaction policy forbids. They get 3-5 lines of guidance instead.

Every LLM answer is verified before anything is written:
  dependency: version spec >= scanner's fixed version, version exists in the npm registry,
              lockfile still resolves
  config:     still valid YAML / Dockerfile, the specific Checkov policy now passes, no
              [REDACTED] markers written to disk, change is small
PRs are opened as DRAFTS titled "[AI-draft]". Marking one "Ready for review" re-runs the full
security pipeline on it (the workflow listens for `ready_for_review`).
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from .llm import LLMError, Provider, extract_json
from .redact import RedactionConfig, RedactionError, Redactor
from .triage import AuditLog, load_prompt

SEMVER_RE = re.compile(r"(\d+)\.(\d+)\.(\d+)")


def _ver(s: str) -> tuple[int, int, int] | None:
    m = SEMVER_RE.search(s or "")
    return tuple(int(x) for x in m.groups()) if m else None


def _min_fixed(fixed_versions: list[str], installed: str) -> str | None:
    """Trivy may list several fixed versions ("4.17.21, 5.0.0"): pick the lowest one that is
    newer than what is installed, i.e. the smallest safe upgrade."""
    inst = _ver(installed) or (0, 0, 0)
    cands = []
    for fv in fixed_versions:
        for part in re.split(r"[,\s|]+", fv):
            v = _ver(part)
            if v and v > inst:
                cands.append(v)
    if not cands:
        return None
    return ".".join(map(str, min(cands)))


def _run(cmd: list[str], cwd: Path, timeout: int = 600) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)


def pick_candidates(triage: dict, repo: Path, cfg: RedactionConfig, top: int) -> list[dict]:
    red = Redactor(cfg)
    pkg = json.loads((repo / "package.json").read_text()) if (repo / "package.json").exists() else {}
    direct = set(pkg.get("dependencies", {})) | set(pkg.get("devDependencies", {}))
    deps, configs = [], []
    for r in triage["clusters"]:
        t = r["triage"]
        if r["is_secret"] or t.get("hallucination") or t.get("verdict") != "true_positive":
            continue
        if r["package"] and set(r["stages"]) & {"sca", "container"} and r["fixed_versions"]:
            if r["package"] in direct or "sca" in r["stages"]:
                deps.append({**r, "kind": "dependency", "direct": r["package"] in direct})
        elif "iac" in r["stages"] and r["files"]:
            allowed = [f for f in r["files"] if red.fix_context_allowed(f) and (repo / f).exists()]
            if allowed:
                configs.append({**r, "kind": "config", "file": allowed[0]})
    def non_breaking(r):
        fix, inst = _ver(_min_fixed(r["fixed_versions"], r["installed_version"]) or ""), _ver(r["installed_version"])
        return bool(fix and inst and fix[0] == inst[0])
    # smallest safe change first: same-major upgrades before risky major jumps, then by risk
    deps.sort(key=lambda r: (not non_breaking(r), -r["final_rank_score"]))
    configs.sort(key=lambda r: -r["final_rank_score"])
    # diversity: alternate dependency and config fixes
    picked, i = [], 0
    while len(picked) < top and (deps or configs):
        src = deps if (i % 2 == 0 and deps) or not configs else configs
        picked.append(src.pop(0))
        i += 1
    return picked


# ------------------------------------------------------------------------------ dependency fix
def draft_dependency(c: dict, repo: Path, provider: Provider, red: Redactor, audit: AuditLog) -> dict:
    pkg_path = repo / "package.json"
    pkg = json.loads(pkg_path.read_text())
    deps_scrubbed = json.loads(red.config_context("package.json", json.dumps(
        {"dependencies": pkg.get("dependencies", {})}, indent=1), max_lines=400))
    min_fix = _min_fixed(c["fixed_versions"], c["installed_version"])
    request = {"finding": {"package": c["package"], "installed_version": c["installed_version"],
                           "fixed_version": min_fix or ", ".join(c["fixed_versions"]),
                           "vuln_ids": c["vuln_ids"][:15], "cwe": c["cwe"], "severity": c["severity"],
                           "is_direct_dependency": c["direct"]},
               **deps_scrubbed}
    system = load_prompt("fix_dependency_system.md")
    user = red.safe_payload(request)
    resp = None
    try:
        resp = provider.complete(system, user, max_tokens=4000)
        ans = extract_json(resp)
    finally:
        audit.record("fix_dependency", system, user, resp, {"cluster": c["cluster_id"]})

    checks = []
    if ans.get("refuse"):
        return {"status": "refused", "reason": ans.get("reason", ""), "checks": checks}
    if ans.get("package") != c["package"]:
        return {"status": "rejected", "reason": f"model changed package name to {ans.get('package')!r}", "checks": checks}
    spec = str(ans.get("new_version_spec", "")).strip()
    want = _ver(spec)
    if not want or not min_fix or want < _ver(min_fix):
        return {"status": "rejected", "reason": f"spec {spec!r} is below scanner fixed version {min_fix}", "checks": checks}
    checks.append(f"✅ version spec {spec} >= scanner fixed version {min_fix}")
    exact = ".".join(map(str, want))
    if shutil.which("npm"):
        r = _run(["npm", "view", f"{c['package']}@{exact}", "version", "--json"], repo, 120)
        if r.returncode != 0 or exact not in r.stdout:
            return {"status": "rejected", "reason": f"{c['package']}@{exact} does not exist on npm (hallucinated version)",
                    "checks": checks}
        checks.append(f"✅ {c['package']}@{exact} exists in the npm registry")
    else:
        checks.append("⚠️ npm not available: registry existence not checked")

    original = pkg_path.read_text()
    if c["direct"] and c["package"] in pkg.get("dependencies", {}):
        pkg["dependencies"][c["package"]] = spec
        checks.append(f"✅ direct dependency updated in package.json")
    else:
        pkg.setdefault("overrides", {})[c["package"]] = spec
        checks.append("✅ transitive dependency pinned with npm `overrides`")
    pkg_path.write_text(json.dumps(pkg, indent=2, ensure_ascii=False) + "\n")
    if shutil.which("npm"):
        r = _run(["npm", "install", "--package-lock-only", "--package-lock=true", "--ignore-scripts",
                  "--no-audit", "--no-fund"], repo, 900)
        (repo / "package-lock.json").unlink(missing_ok=True)   # Juice Shop does not commit a lockfile
        if r.returncode != 0:
            pkg_path.write_text(original)
            return {"status": "rejected", "reason": "dependency tree no longer resolves: " + r.stderr[-300:],
                    "checks": checks}
        checks.append("✅ dependency tree still resolves (npm lockfile generation succeeded)")
    return {"status": "ready", "files": ["package.json"], "title": ans.get("pr_title") or f"Upgrade {c['package']} to {spec}",
            "body": ans.get("pr_body", ""), "risk": ans.get("breaking_change_risk", "unknown"), "checks": checks}


# ------------------------------------------------------------------------------ config fix
def draft_config(c: dict, repo: Path, provider: Provider, red: Redactor, audit: AuditLog) -> dict:
    rel = c["file"]
    path = repo / rel
    original = path.read_text()
    scrubbed = red.config_context(rel, original, max_lines=400)
    request = {"finding": {"policy_id": c["rule_id"], "policy_name": c["title"], "file": rel,
                           "occurrences": c["count"], "severity": c["severity"]},
               "file_content": scrubbed}
    system = load_prompt("fix_config_system.md")
    user = red.safe_payload(request)
    resp = None
    try:
        resp = provider.complete(system, user, max_tokens=6000)
        ans = extract_json(resp)
    finally:
        audit.record("fix_config", system, user, resp, {"cluster": c["cluster_id"]})

    checks = []
    if ans.get("refuse"):
        return {"status": "refused", "reason": ans.get("reason", ""), "checks": checks}
    new = ans.get("new_content", "")
    if ans.get("file") != rel or not new.strip():
        return {"status": "rejected", "reason": "model returned a different file or empty content", "checks": checks}
    try:
        new = red.restore_config(new)          # put real names and untouched secret lines back, locally
    except RedactionError as e:
        return {"status": "rejected", "reason": f"{e}; a human must apply this fix", "checks": checks}
    checks.append("✅ redacted values restored locally; no secret line was edited by the model")
    if rel.endswith((".yaml", ".yml")):
        import yaml
        try:
            list(yaml.safe_load_all(new))
        except yaml.YAMLError as e:
            return {"status": "rejected", "reason": f"invalid YAML: {e}", "checks": checks}
        checks.append("✅ valid YAML")
    elif "Dockerfile" in rel and "FROM" not in new:
        return {"status": "rejected", "reason": "Dockerfile has no FROM", "checks": checks}
    import difflib
    changed = sum(1 for ln in difflib.unified_diff(original.splitlines(), new.splitlines(), lineterm="", n=0)
                  if ln[:1] in "+-" and not ln.startswith(("+++", "---")))
    if changed > 40:
        return {"status": "rejected", "reason": f"change too large ({changed} lines) for an automated fix", "checks": checks}
    checks.append(f"✅ small change ({changed} lines)")

    if shutil.which("checkov"):
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td) / Path(rel).name
            tmp.write_text(new)
            fw = "dockerfile" if "Dockerfile" in rel else "terraform" if rel.endswith(".tf") else "kubernetes"
            r = _run(["checkov", "-f", str(tmp), "--framework", fw, "--check", c["rule_id"], "-o", "json",
                      "--quiet", "--skip-download"], repo, 300)
            try:
                res = json.loads(r.stdout or "{}")
                res = res[0] if isinstance(res, list) else res
                failed = res.get("results", {}).get("failed_checks", []) if "results" in res else []
            except json.JSONDecodeError:
                failed = ["unparseable"]
            if failed:
                return {"status": "rejected", "reason": f"{c['rule_id']} still fails after the AI fix", "checks": checks}
        checks.append(f"✅ Checkov {c['rule_id']} passes on the new file")
    else:
        checks.append("⚠️ checkov not installed: policy not re-verified")
    path.write_text(new if new.endswith("\n") else new + "\n")
    return {"status": "ready", "files": [rel], "title": ans.get("pr_title") or f"Fix {c['rule_id']} in {rel}",
            "body": ans.get("pr_body", "") + "\n\n" + ans.get("changed_lines_summary", ""), "checks": checks}


# ------------------------------------------------------------------------------ orchestration
def review_notes_template(c: dict, res: dict, pr_url: str) -> str:
    return f"""# Review notes: {res.get('title', c['cluster_id'])}

- **Cluster:** `{c['cluster_id']}` · {c['severity']} · {c['title']}
- **Kind:** {c['kind']} · **PR:** {pr_url or '(not opened)'}
- **Automated verification:**
{chr(10).join('  - ' + x for x in res.get('checks', []))}

## Human review (fill in)

| Question | Answer |
|---|---|
| Is the change correct on first review? (yes / no / partly) | |
| Does it fix the reported advisory or policy? How did you verify? | |
| Side effects or breaking changes found when testing? | |
| Did the LLM hallucinate anything (versions, ids, settings)? | |
| Decision (merge / merge with edits / reject) and why | |
"""


def draft_prs(triage_path: Path, repo: Path, provider: Provider, cfg: RedactionConfig, out_dir: Path,
              top: int = 2, open_prs: bool = False, base: str = "main") -> list[dict]:
    triage_data = json.loads(Path(triage_path).read_text())
    red = Redactor(cfg)
    audit = AuditLog(out_dir)
    (out_dir / "prs").mkdir(parents=True, exist_ok=True)
    results = []
    for c in pick_candidates(triage_data, repo, cfg, top=top * 2):
        if sum(1 for r in results if r["status"] == "ready") >= top:
            break
        branch = f"pf/ai-fix-{c['cluster_id'].lower()}"
        if open_prs:
            _run(["git", "checkout", "-B", branch, f"origin/{base}"], repo)
        try:
            fn = draft_dependency if c["kind"] == "dependency" else draft_config
            res = fn(c, repo, provider, red, audit)
        except (LLMError, RedactionError, json.JSONDecodeError, ValueError) as e:
            res = {"status": "error", "reason": str(e), "checks": []}
        res.update({"cluster_id": c["cluster_id"], "kind": c["kind"], "branch": branch})
        pr_url = ""
        if res["status"] == "ready":
            diff = _run(["git", "diff", "--", *res["files"]], repo).stdout
            (out_dir / "prs" / f"{c['cluster_id']}.patch").write_text(diff)
            body = (f"> 🤖 **AI-drafted remediation, human approval required.** Generated by PipelineFortress "
                    f"(`{provider.name}` {getattr(provider, 'model', '')}). Mark *Ready for review* to run the "
                    f"full security pipeline on this change.\n\n{res['body']}\n\n### Automated verification\n"
                    + "\n".join(f"- {x}" for x in res["checks"])
                    + f"\n\n### Finding\n- Cluster `{c['cluster_id']}` · {c['severity']} · {c['title']}\n"
                    + (f"- Advisories: {', '.join(c['vuln_ids'][:10])}\n" if c["vuln_ids"] else "")
                    + "\n### Reviewer checklist\n- [ ] Change is correct and minimal\n- [ ] Security pipeline "
                      "passes on this PR\n- [ ] App still works (smoke test)\n- [ ] No hallucinated versions / ids\n")
            (out_dir / "prs" / f"{c['cluster_id']}.md").write_text(f"# [AI-draft] {res['title']}\n\n{body}")
            if open_prs:
                _run(["git", "add", *res["files"]], repo)
                _run(["git", "-c", "user.name=pipelinefortress-bot", "-c",
                      "user.email=pipelinefortress-bot@users.noreply.github.com", "commit", "-m",
                      f"[AI-draft] {res['title']}"], repo)
                push = _run(["git", "push", "-f", "origin", branch], repo)
                if push.returncode == 0 and shutil.which("gh"):
                    pr = _run(["gh", "pr", "create", "--draft", "--base", base, "--head", branch,
                               "--title", f"[AI-draft] {res['title']}"[:100], "--body", body], repo)
                    pr_url = pr.stdout.strip() or pr.stderr.strip()[:200]
                else:
                    pr_url = "push failed: " + push.stderr[-200:]
                res["pr"] = pr_url
        if not open_prs:
            _run(["git", "checkout", "--", "package.json", *([c["file"]] if c.get("file") else [])], repo)
        (out_dir / "prs" / f"{c['cluster_id']}_review.md").write_text(review_notes_template(c, res, pr_url))
        results.append(res)
    if open_prs:
        _run(["git", "checkout", base], repo)
    (out_dir / "prs" / "summary.json").write_text(json.dumps(results, indent=1))
    return results
