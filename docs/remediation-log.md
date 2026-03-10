# CI/CD Remediation Log

This log records major implementation failures encountered during portfolio hardening, including root causes, fixes, and engineering lessons.

## 1) Legacy CI/CD overlap and pipeline ambiguity
- **Title:** GitLab and upstream workflow overlap
- **Pipeline stage / area affected:** CI orchestration and repository governance
- **Symptom:** Mixed CI definitions diluted ownership and execution clarity.
- **Root cause:** Inherited fork carried automation not aligned to a GitHub-only operating model.
- **Fix implemented:** Archived legacy CI artifacts under `legacy/` and kept security-focused GitHub workflows active.
- **Why the fix was correct:** Reduced ambiguity and established one authoritative control plane.
- **Lesson learned:** Security posture requires a single source of truth for automation.

## 2) Branch trigger gaps
- **Title:** Feature-branch CI not consistently triggered
- **Pipeline stage / area affected:** Workflow triggering model
- **Symptom:** Some branch pushes/PR events did not execute intended checks.
- **Root cause:** Restrictive or inconsistent trigger definitions.
- **Fix implemented:** Standardized `push`, `pull_request`, and `workflow_dispatch` trigger behavior.
- **Why the fix was correct:** Ensured quality/security signal coverage for feature and review flows.
- **Lesson learned:** Trigger correctness is foundational to all downstream controls.

## 3) Build workflow lockfile assumption
- **Title:** Build stage failed when lockfile was absent
- **Pipeline stage / area affected:** `build_test`
- **Symptom:** CI expected lockfile-driven install behavior in a repo without lockfile.
- **Root cause:** Workflow implementation diverged from repository dependency model.
- **Fix implemented:** Switched to lockfile-agnostic install behavior and removed invalid assumptions.
- **Why the fix was correct:** Installation now matches actual repository contract.
- **Lesson learned:** CI dependency strategy must follow repository reality.

## 4) Broken artifact paths
- **Title:** Upload steps failed due to missing files
- **Pipeline stage / area affected:** SARIF/log artifact publishing
- **Symptom:** Pipeline failures caused by uploading files not always produced.
- **Root cause:** Unconditional upload behavior.
- **Fix implemented:** Added file-existence checks and conditional upload logic.
- **Why the fix was correct:** Preserved actionable failures while removing false negatives.
- **Lesson learned:** Reporting robustness is part of secure delivery engineering.

## 5) Native module binding failures (`libxmljs2`)
- **Title:** Server tests failed from missing native bindings
- **Pipeline stage / area affected:** `build_test` installation/test execution
- **Symptom:** `npm run test:server` failed with missing `xmljs.node`.
- **Root cause:** Install optimization skipped scripts needed for native addon build.
- **Fix implemented:** Restored script execution where runtime tests require native modules; added explicit rebuild step.
- **Why the fix was correct:** Native dependencies compile reliably before test execution.
- **Lesson learned:** Correctness must dominate speed in build-and-test stages.

## 6) API test instability
- **Title:** API suites failed intermittently in CI
- **Pipeline stage / area affected:** `build_test` API testing
- **Symptom:** Multiple API suites failed under CI runtime conditions.
- **Root cause:** Environment-dependent challenge behavior in test context.
- **Fix implemented:** Standardized deterministic behavior for test runtime.
- **Why the fix was correct:** Stabilized API test outcomes across pipeline runs.
- **Lesson learned:** Deterministic tests are mandatory for enforceable branch protection.

## 7) Trivy configuration scan misuse
- **Title:** Invalid Trivy config invocation
- **Pipeline stage / area affected:** `container_build_and_scan`
- **Symptom:** Config scanning failed when passing invalid multi-target positional arguments.
- **Root cause:** CLI misuse.
- **Fix implemented:** Split into valid target-specific scan invocations.
- **Why the fix was correct:** Restored expected scanner behavior and gate execution.
- **Lesson learned:** Security tooling quality includes precise command semantics.

## 8) SBOM output directory failure
- **Title:** SBOM generation failed with `ENOENT`
- **Pipeline stage / area affected:** `security_checks` SBOM generation
- **Symptom:** SBOM action could not write output file.
- **Root cause:** Output directory was not pre-created.
- **Fix implemented:** Added explicit `mkdir -p` pre-step.
- **Why the fix was correct:** Satisfied action filesystem preconditions.
- **Lesson learned:** CI filesystem assumptions should always be explicit.

## 9) ZAP writable directory failure
- **Title:** ZAP baseline failed on write permissions
- **Pipeline stage / area affected:** `dast`
- **Symptom:** ZAP container failed writing runtime files in mounted workdir.
- **Root cause:** Non-writable mount behavior in runner/container context.
- **Fix implemented:** Created and mounted writable report/work directory for ZAP.
- **Why the fix was correct:** ZAP report generation completed reliably.
- **Lesson learned:** DAST container execution requires explicit writable workspace design.

## 10) Semgrep and SARIF robustness
- **Title:** Security-stage reporting fragility
- **Pipeline stage / area affected:** `security_checks`
- **Symptom:** Blocking findings plus missing SARIF outputs produced brittle behavior.
- **Root cause:** Optional outputs were treated as always-present artifacts.
- **Fix implemented:** Added robust SARIF existence checks and baseline-aware handling.
- **Why the fix was correct:** Maintained enforceable findings with stable reporting.
- **Lesson learned:** Strict gates and robust evidence handling must be designed together.

## 11) Protected deploy branch mismatch
- **Title:** Protected deploy did not run after merge
- **Pipeline stage / area affected:** `deploy`
- **Symptom:** Deploy was skipped due to branch condition mismatch over time.
- **Root cause:** Branch guard drift from actual default/protected branch strategy.
- **Fix implemented:** Aligned protected deploy condition to `refs/heads/master` and retained PR block.
- **Why the fix was correct:** Deploy now executes on `master` push/merge events only.
- **Lesson learned:** Branch-policy drift can silently disable release controls.

## 12) Deploy validation failures (Kind + rollout)
- **Title:** Deploy validation failed despite prior-stage success
- **Pipeline stage / area affected:** `deploy_validation`
- **Symptom:**
  - initial image-load failure in Kind,
  - then rollout timeout with crash-looping pod.
- **Root cause:**
  - Kind cluster-name mismatch.
  - Local hardened overlay conflicted with inherited app startup write behavior.
  - K8s blocking gate included local compatibility overlay.
- **Fix implemented:**
  - set explicit Kind cluster name,
  - added local overlay runtime compatibility patch,
  - split K8s policy scope: base (blocking), local overlay (non-blocking reporting).
- **Why the fix was correct:** Deploy validation became operational while base hardening gate remained strict.
- **Lesson learned:** Compatibility exceptions should be scoped, documented, and policy-bounded.

## 13) CodeQL action deprecation
- **Title:** CodeQL action version drift
- **Pipeline stage / area affected:** `security_checks` and SARIF upload integration
- **Symptom:** Deprecation warning for CodeQL v3 action family.
- **Root cause:** Outdated action major version references.
- **Fix implemented:** Upgraded CodeQL action usage to v4.
- **Why the fix was correct:** Removed deprecation risk and aligned with supported action lifecycle.
- **Lesson learned:** Security automation dependencies require active lifecycle maintenance.

## 14) ZAP informational authentication alert blocked DAST gate
- **Title:** ZAP baseline exited on expected authentication-endpoint discovery
- **Pipeline stage / area affected:** `dast`
- **Symptom:** ZAP reported `WARN-NEW: Authentication Request Identified [10111]` on `/rest/user/login` and exited with code `2`, failing pipeline runs.
- **Root cause:** ZAP baseline treats warnings as non-zero exit; alert `10111` was not explicitly policy-tuned even though it is expected auth-surface detection for this app.
- **Fix implemented:** Added explicit rule entry in `.zap/rules.tsv`: `10111 INFO (...)`, and kept the workflow using `-c /zap/rules.tsv`.
- **Why the fix was correct:** The pipeline still fails on real vulnerability findings while keeping authentication-endpoint detection visible as informational evidence.
- **Lesson learned:** Security gates should stay strict, but tooling policy must be narrowly tuned to expected behavior to avoid false-failures.

## 15) ZAP exception governance hardening
- **Title:** Exception metadata and review lifecycle were implicit
- **Pipeline stage / area affected:** `dast` policy governance
- **Symptom:** Exception ownership and expiry were not explicitly encoded in the policy file.
- **Root cause:** Early policy tuning prioritized functional gating but not full exception lifecycle governance metadata.
- **Fix implemented:** Added `owner=` and `expires=` metadata directly in `.zap/rules.tsv` exception entries and documented review/expiry process in README and `docs/security-pipeline.md`.
- **Why the fix was correct:** Exceptions now have accountable owners, a bounded lifetime, and a documented renewal/removal path.
- **Lesson learned:** Risk acceptance without owner/expiry metadata is incomplete governance.
