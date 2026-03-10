# Sock Shop DevSecOps/AppSec Portfolio

## 1. Project title and one-paragraph summary
This repository is a senior-level DevSecOps/AppSec portfolio project built by securing and operationalizing an inherited open-source application (OWASP Juice Shop lineage). The work focuses on CI/CD rationalization, gated security automation, container and deployment hardening, and failure-driven remediation. The result is a GitHub-native pipeline and deploy model that demonstrates realistic application security engineering decisions rather than a greenfield demo.

## 2. What this project demonstrates
- Security onboarding of inherited software with existing technical debt.
- CI/CD cleanup and standardization to GitHub Actions.
- Gated pipeline design with explicit quality/security/deploy controls.
- Multi-layer security automation: SAST, secret scanning, dependency/container scanning, SBOM, signing-readiness, and DAST.
- Protected deploy policy tied to `master`.
- Manual deploy validation path for feature branches.
- Performance optimization with concurrency, caching, and artifact reuse without removing core security coverage.
- Troubleshooting-driven hardening based on real pipeline failures.

## 3. Architecture / pipeline overview
Active workflow: `.github/workflows/devsecops-gated.yml`

Gated flow:
1. `build_test`
2. `security_checks`
3. `container_build_and_scan`
4. `dast`
5. `deploy` or `deploy_validation`

Execution model:
- `build_test` must pass first.
- `security_checks`, `container_build_and_scan`, and `dast` start after `build_test`.
- `deploy` requires all prior jobs and only runs on `refs/heads/master` (never on PR events).
- `deploy_validation` is manual (`workflow_dispatch` + input flag) and runs only on non-`master` branches.

## 4. Security controls implemented
- **CodeQL**: GitHub code scanning (`github/codeql-action@v4`) in `security_checks`.
- **Semgrep**: policy scan with baseline-aware behavior for PR/push contexts.
- **Gitleaks**: commit-range secret scanning with SARIF upload.
- **Trivy**:
  - filesystem vulnerability scan in `security_checks`.
  - image vulnerability scan in `container_build_and_scan`.
  - Dockerfile misconfiguration gate (blocking).
  - Kubernetes misconfiguration gate for `deployment/kubernetes/base` (blocking).
  - local overlay scan (non-blocking, explicitly for demo deploy compatibility).
- **SBOM**: Syft/CycloneDX generation (`anchore/sbom-action`) and artifact publication.
- **Signing readiness**: Cosign install + recorded keyless signing guidance artifact.
- **DAST**: OWASP ZAP baseline against repository-controlled local runtime (not third-party demo targets).
- **Deploy gating**: deploy blocked unless all prerequisite jobs pass.
- **Artifact reuse**: build output and container image are reused downstream to avoid inconsistent rebuilds.
- **Branch protection assumption (verified 2026-03-10)**:
  - required status checks: `build_test`, `security_checks`, `container_build_and_scan`, `dast`
  - 1 required approving review
  - default branch: `master`

## 5. Problems encountered and what was fixed
| Problem | Root cause | Fix | Lesson learned |
|---|---|---|---|
| Inherited CI/CD clutter | Mixed GitLab CI and upstream maintenance automation in a GitHub-focused repo | Archived legacy CI and upstream maintenance workflows under `legacy/` and kept security-focused GitHub Actions active | Portfolio repos need one clear automation story |
| Pipeline triggers missed feature branches | Branch-restricted trigger logic | Enabled push/PR coverage across branches and manual dispatch | Triggers are part of security posture; silent non-execution is risk |
| Build job failed without lockfile | Workflow assumed lockfile for `npm ci` and npm cache mode | Switched to `npm install` behavior compatible with no lockfile and removed broken assumptions | CI must match the actual dependency model |
| Broken artifact upload paths | Upload step referenced files not always generated | Added file-existence checks before SARIF/artifact upload | Resilient pipelines fail on signal, not on missing optional outputs |
| Node support mismatch | App logic used narrower version than tests expected | Aligned runtime support logic to `20 - 24` while standardizing CI runtime on Node 22 | Separate runtime policy from test assertions explicitly |
| API test instability | Environment-dependent challenge toggles | Made API test behavior deterministic for test runtime | Determinism is required for trustworthy security gates |
| Trivy config command invalid usage | Attempted to pass multiple positional config targets in one call | Split into correct Trivy invocations by target | Security tooling must be used with strict CLI correctness |
| SBOM path failure (`ENOENT`) | Output directory not created before SBOM write | Added pre-step to create SBOM output directory | File-system preconditions should be explicit in CI |
| ZAP write permission failure | `/zap/wrk` mount not writable in GitHub runner/container context | Created and mounted writable report directory for ZAP outputs | DAST containers need explicit writable workspaces in CI |
| Native module failure (`libxmljs2`) | Install optimizations skipped lifecycle scripts needed for native bindings | Restored script execution for test jobs and rebuilt native bindings in build phase | Do not trade correctness for install speed in runtime/test jobs |
| Semgrep/SARIF handling instability | Blocking findings and missing SARIF uploads caused noisy failures | Added robust SARIF existence checks and improved handling logic | Security gates should be strict and diagnosable |
| Deploy skipped unexpectedly | Branch condition targeted wrong branch semantics over time | Protected deploy explicitly aligned to `refs/heads/master` | Branch guard conditions must match real branch strategy |
| Deploy validation rollout failures | Kind cluster-name mismatch, then app startup/runtime mismatch in hardened local overlay | Set explicit Kind cluster name, added local overlay compatibility patch, and split blocking/non-blocking K8s Trivy scope | Validation environments should be secure but also operationally realistic |
| CodeQL v3 deprecation warning | Outdated action major version | Upgraded all CodeQL actions to `v4` | Keep security tooling dependencies current |

## 6. Validation evidence
Verified directly:
- Workflow syntax validation: `actionlint` passed for active workflow.
- GitHub Actions event behavior and job outcomes:
  - Feature-branch push run: `22882208517` (`push` on `devsecops-finalize`) -> required checks passed, `deploy`/`deploy_validation` skipped (expected).
  - PR run: `22880716114` (`pull_request`) -> checks passed, `deploy` skipped (expected).
  - Master push run: `22881386491` (`push` on `master`) -> `deploy` succeeded.
  - Manual feature-branch deploy validation run: `22873458723` (`workflow_dispatch`) -> `deploy_validation` succeeded, protected `deploy` skipped (expected).
- Branch protection (API check on 2026-03-10) confirms required checks and review requirements on `master`.

Unverified in this final pass:
- A full fresh local manual run from a clean machine image was not re-executed in this specific pass (CI evidence is current).

## 7. How to run locally
### Native Linux/WSL (recommended)
1. Install/use Node 22:
   - `nvm install 22`
   - `nvm use 22`
2. Install dependencies:
   - `npm install --prefer-offline --no-audit --progress=false`
3. Start app:
   - `npm start`
4. Verify health endpoint:
   - `curl -fsS http://127.0.0.1:3000/rest/admin/application-version`

Useful verification commands:
- `npm run lint`
- `npm run test:server`
- `npm run test:api`

### Docker run method
1. Build image:
   - `docker build -t juice-shop:local .`
2. Run container:
   - `docker run --rm -p 3000:3000 juice-shop:local`
3. Verify endpoint:
   - `curl -fsS http://127.0.0.1:3000/rest/admin/application-version`

## 8. How the GitHub automation works
- **On push (all branches, except docs/markdown-only changes):** runs build, security, container scan, and DAST stages.
- **On pull_request (except docs/markdown-only changes):** runs same required validation stages; deploy is blocked.
- **On workflow_dispatch:** can run full pipeline manually; set `run_deploy_validation=true` to run `deploy_validation` on non-`master` branches.
- **Required checks before merge to `master` (branch protection):**
  - `build_test`
  - `security_checks`
  - `container_build_and_scan`
  - `dast`
- **After merge/push to `master`:** protected `deploy` runs automatically after prerequisites succeed.
- **Auto-merge model:** if enabled in GitHub settings and required checks/review conditions are met, PRs can auto-merge.

## 9. Remaining caveats / accepted risks
- This remains an inherited intentionally vulnerable application; some dependency and design risks are upstream by nature.
- ZAP policy tuning includes explicit accepted-risk handling for selected upstream training behaviors.
- Local deploy overlay intentionally relaxes immutable root filesystem for startup compatibility; blocking K8s hardening gate remains on base manifests.
- Workflow `paths-ignore` excludes docs/markdown-only changes from expensive CI runs; docs-only changes will not produce full pipeline signals.
- Branch protection `strict` mode is currently disabled (`strict: false`); requiring branches to be up-to-date before merge would be a stricter posture.

## 10. Why this is senior-level work
This repository demonstrates senior-level capability because it shows end-to-end ownership across inherited-system assessment, pipeline architecture, security control integration, troubleshooting under failure, pragmatic risk decisions, and production-style governance (branch protection, required checks, protected deploy). The implementation balances security rigor with operational reliability, and the remediation trail is explicit and auditable.
