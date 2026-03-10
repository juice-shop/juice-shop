# CI/CD Remediation Log

This document records major implementation failures and corrective actions applied during the DevSecOps/AppSec portfolio hardening effort.

## 1) Legacy CI/CD overlap and pipeline ambiguity
- **Title:** GitLab and upstream workflow overlap
- **Pipeline stage / area affected:** CI orchestration and repository governance
- **Symptom:** Mixed CI definitions (GitLab + upstream maintenance workflows) diluted ownership and execution clarity.
- **Root cause:** Inherited fork carried upstream automation not aligned to this repository's GitHub-only model.
- **Fix implemented:** Archived legacy CI artifacts under `legacy/` and kept security-focused GitHub workflows active.
- **Why the fix was correct:** It reduced ambiguity and enforced a single control plane for checks and deploy behavior.
- **Lesson learned:** Security posture requires one authoritative automation platform.

## 2) Branch trigger gaps
- **Title:** Feature-branch CI not consistently triggered
- **Pipeline stage / area affected:** Workflow triggering model
- **Symptom:** Some branch pushes/PR events did not execute intended checks.
- **Root cause:** Restrictive or inconsistent trigger conditions.
- **Fix implemented:** Standardized triggers for `push`, `pull_request`, and `workflow_dispatch` with coherent branch behavior.
- **Why the fix was correct:** It guarantees quality/security signals for feature work and review flows.
- **Lesson learned:** Trigger correctness is foundational to every downstream control.

## 3) Build workflow lockfile assumption
- **Title:** Build stage failed when lockfile was absent
- **Pipeline stage / area affected:** `build_test`
- **Symptom:** CI expected lockfile-driven install behavior and failed in a repository without `package-lock.json`.
- **Root cause:** Workflow used lockfile assumptions inconsistent with repo state.
- **Fix implemented:** Switched to lockfile-agnostic install behavior (`npm install`) and removed lockfile-dependent cache assumptions.
- **Why the fix was correct:** It aligned CI install strategy to the actual dependency model.
- **Lesson learned:** Installation strategy must match repository contract, not preference.

## 4) Broken artifact paths
- **Title:** Upload steps failed due missing files
- **Pipeline stage / area affected:** SARIF/log artifact publishing
- **Symptom:** Pipeline failed on uploads for files that were not generated in all paths.
- **Root cause:** Unconditional upload steps.
- **Fix implemented:** Added pre-checks and conditional upload logic.
- **Why the fix was correct:** It preserves failure signaling for real issues while avoiding false negatives.
- **Lesson learned:** Artifact publication must be conditional unless generation is guaranteed.

## 5) Native module binding failures (`libxmljs2`)
- **Title:** Server tests failed from missing native bindings
- **Pipeline stage / area affected:** `build_test` dependency installation/test execution
- **Symptom:** `npm run test:server` failed with missing `xmljs.node` bindings.
- **Root cause:** Install speed optimization used script-skipping behavior incompatible with native addon compilation.
- **Fix implemented:** Restored lifecycle script execution for runtime/test jobs and explicitly rebuilt `libxmljs2` in `build_test`.
- **Why the fix was correct:** Native dependencies were compiled in CI context before tests.
- **Lesson learned:** Performance optimizations must be scoped so they never break runtime correctness.

## 6) API test instability
- **Title:** API suites failed intermittently in CI
- **Pipeline stage / area affected:** `build_test` API test execution
- **Symptom:** Multiple API suites failed under CI runtime conditions.
- **Root cause:** Environment-dependent challenge behavior in test context.
- **Fix implemented:** Standardized test behavior for `NODE_ENV=test` via test configuration.
- **Why the fix was correct:** It restored deterministic API test outcomes across CI runs.
- **Lesson learned:** Deterministic tests are mandatory for enforceable branch protection.

## 7) Trivy configuration scan misuse
- **Title:** Invalid Trivy config invocation
- **Pipeline stage / area affected:** `container_build_and_scan`
- **Symptom:** Trivy failed when config scanning multiple positional targets in one command.
- **Root cause:** CLI misuse against Trivy command model.
- **Fix implemented:** Split config scans into valid target-specific invocations.
- **Why the fix was correct:** It matched tool contract and restored scan execution.
- **Lesson learned:** Security tool correctness includes exact CLI semantics.

## 8) SBOM output directory failure
- **Title:** SBOM generation failed with `ENOENT`
- **Pipeline stage / area affected:** `security_checks` SBOM generation
- **Symptom:** `anchore/sbom-action` could not write `sbom/syft-cyclonedx.json`.
- **Root cause:** Destination directory did not exist at write time.
- **Fix implemented:** Added explicit `mkdir -p sbom` before SBOM generation.
- **Why the fix was correct:** It established required filesystem precondition.
- **Lesson learned:** CI filesystem assumptions should always be explicit.

## 9) ZAP writable directory failure
- **Title:** ZAP baseline failed with permission denied on `/zap/wrk`
- **Pipeline stage / area affected:** `dast`
- **Symptom:** ZAP container started but failed writing runtime files.
- **Root cause:** Mounted directory permissions were not compatible with container write expectations.
- **Fix implemented:** Prepared writable host directory and mounted it read-write for ZAP output.
- **Why the fix was correct:** ZAP could generate reports/config successfully in runner context.
- **Lesson learned:** DAST containers need explicit writable working directories in CI.

## 10) Semgrep and SARIF robustness
- **Title:** Security stage produced brittle SARIF handling
- **Pipeline stage / area affected:** `security_checks`
- **Symptom:** Blocking Semgrep findings combined with missing SARIF uploads created noisy failures.
- **Root cause:** Missing conditional logic around optional output artifacts and baseline handling.
- **Fix implemented:** Added robust SARIF existence checks and improved baseline-aware scanning behavior.
- **Why the fix was correct:** Findings remain enforceable while reporting remains reliable.
- **Lesson learned:** Strict gates and robust reporting must be designed together.

## 11) Protected deploy branch mismatch
- **Title:** Protected deploy never executed after merge
- **Pipeline stage / area affected:** `deploy`
- **Symptom:** Deploy job skipped because branch condition and actual default branch diverged over time.
- **Root cause:** Branch guard condition did not reflect repository branch strategy.
- **Fix implemented:** Explicitly aligned protected deploy guard to `refs/heads/master` and preserved PR block.
- **Why the fix was correct:** Deploy now runs on master push/merge events only.
- **Lesson learned:** Branch policy drift can silently disable release automation.

## 12) Deploy validation failures (Kind + rollout)
- **Title:** Deploy validation failed despite upstream stage success
- **Pipeline stage / area affected:** `deploy_validation`
- **Symptom:** Initial failure loading image into Kind; subsequent rollout timeout with crash-looping pod.
- **Root cause:**
  - Kind cluster-name mismatch (`kind load` target mismatch).
  - Local hardened overlay conflicted with inherited app startup filesystem write behavior.
  - Trivy blocking K8s scan included local compatibility overlay and blocked on expected local tradeoffs.
- **Fix implemented:**
  - Set explicit Kind cluster name.
  - Added local overlay compatibility patch for deploy validation path.
  - Split K8s Trivy policy: blocking on `deployment/kubernetes/base`, non-blocking reporting on local overlay.
- **Why the fix was correct:** Validation deploy became operational while preserving blocking hardening checks on base manifests.
- **Lesson learned:** Environment-specific compatibility should be explicit, bounded, and policy-documented.

## 13) CodeQL action deprecation
- **Title:** CodeQL action version drift
- **Pipeline stage / area affected:** `security_checks` and SARIF upload actions
- **Symptom:** Deprecation warning for CodeQL v3 action family.
- **Root cause:** Workflow still referenced v3 actions.
- **Fix implemented:** Upgraded all CodeQL actions and SARIF upload action references to v4.
- **Why the fix was correct:** Eliminated deprecation risk and aligned with supported action versions.
- **Lesson learned:** Security automation dependencies require proactive lifecycle maintenance.
