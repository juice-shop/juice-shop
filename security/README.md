# PipelineFortress: secure CI/CD with GenAI-assisted triage

Capstone CAP-DSE-3W (DevSecOps Essentials). A shift-left security pipeline wrapped around a fork of
OWASP Juice Shop, plus a GenAI triage tool that never lets secrets or source code reach the LLM.

```
 push / PR ─┬─ 1 Secrets   gitleaks ─────────────┐
            ├─ 2 SAST      Semgrep (+PF rules) ──┤  each stage: gate on NEW findings
            ├─ 3 SCA       Trivy fs ─────────────┤  above its threshold (policy.yaml)
            ├─ 4 IaC       Checkov (+PF policies)┤  vs. the reviewed baseline.json
            └─ 5 Build ► Trivy image ► Syft SBOM ► kind deploy ► ZAP baseline (DAST)
                                                 │
                         6 GenAI triage ◄────────┘  cluster ► redact ► LLM ► guard
                           ├─ PR comment, metrics dashboard, FP/FN evaluation
                           └─ (manual) 7 AI-drafted fix PRs ► human review ► merge
```

## What is where

| Path | What it is | Brief deliverable |
|---|---|---|
| `.github/workflows/pipelinefortress.yml` | Scanning pipeline, read-only token, actions pinned to SHAs | Hardened CI/CD pipeline (YAML) |
| `.github/workflows/pf-ai-fix-prs.yml` | Manual: LLM drafts fixes, opens **draft** PRs | 3 auto-generated PRs (2 for individual) |
| `.github/workflows/pf-baseline-pr.yml` | Manual: baseline update as a reviewed PR (risk acceptance) | |
| `security/policy.yaml` | Gate thresholds per stage | Sensible severity gates |
| `security/checkov/policies/` | 6 custom policies (PF_K8S_1-4, PF_DOCKER_1, PF_GHA_1) | Policy-as-code rules |
| `security/semgrep/pipelinefortress.yml` | 4 project SAST rules | Policy-as-code rules |
| `security/Dockerfile.hardened` | Distroless, non-root UID, healthcheck, pinned bases | Hardened container image |
| `security/k8s/` | Restricted Pod Security, NetworkPolicy, no SA token | CIS-aligned IaC |
| `security/triage/pftriage/` | Triage tool: normalize, cluster, redact, LLM, guard, PRs, evaluate | LLM triage tool + redaction layer |
| `security/triage/pftriage/prompts/` | Versioned prompt library | Prompt library |
| `security/triage/tests/` | 22 tests incl. canary-secret leak tests | Verified redaction |
| `security/metrics/build_dashboard.py` | Self-contained HTML dashboard | Metrics dashboard |
| `security/ground_truth.yaml` | Human labels for FP/FN analysis | Honest FP/FN analysis |
| `security/seeded_vulns.yaml`, `scripts/seed_vulns.sh` | 9 planted bugs to measure catch rate | "Catch 80% before merge" evidence |
| `security/scripts/` | setup, local scans, kind deploy, ZAP summary, image pinning | |
| `security/RUN_GUIDE.md` | **Start here** | |

## Key design decisions (for the oral defense)

1. **Gate on new findings only (ratchet).** Juice Shop has hundreds of intentional findings. Blocking
   on all of them would block every release, which is the CISO's current problem. Existing findings
   live in `baseline.json`, changed only through a reviewed PR.
2. **Deterministic priority first, LLM second.** Risk scores are computed from severity, stage,
   CWE Top 25, fix availability and test-code location. The LLM may move a cluster one step and
   must explain why. Reproducible and auditable.
3. **Redaction in four layers, fail-closed.** Allowlisted fields only; secret findings never sent;
   every string scrubbed (secret patterns, entropy, code, emails, IPs, project names, file paths);
   the final payload re-scanned and blocked if anything remains. CI then scans the audit log of
   everything sent with gitleaks, an independent tool.
4. **The model is never trusted.** The output guard rejects invented CVE/GHSA/CWE ids and versions.
   Fix PRs are verified mechanically (registry lookup, lockfile resolves, Checkov re-run) and opened
   as drafts that a human must approve.
5. **No source code to the LLM means no automatic SAST fixes.** Only dependency and configuration
   fixes are drafted. This trade-off is deliberate and measured in the evaluation.
6. **Write access is separated.** The scanning workflow can't write to the repo; only the two
   manual workflows can, and only to open PRs.
