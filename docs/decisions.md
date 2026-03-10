# Security and Delivery Decisions

## Decision 1: Standardize on GitHub Actions
- **Context:** Inherited repo carried mixed CI artifacts and upstream automation intent.
- **Decision:** Use GitHub Actions as the active control plane; archive legacy CI content for reference.
- **Impact:** Clear ownership and auditable delivery/security policy in one place.

## Decision 2: Enforce gated pipeline before deploy
- **Context:** Security checks must prevent unsafe deployment.
- **Decision:** Deploy jobs require success of `build_test`, `security_checks`, `container_build_and_scan`, and `dast`.
- **Impact:** Explicit quality/security gates before any deployment action.

## Decision 3: Protected deploy only on `master`
- **Context:** Need production-like deploy governance with branch control.
- **Decision:** Protected `deploy` runs only on `refs/heads/master` and never on PR events.
- **Impact:** Feature-branch and PR pipelines cannot deploy through protected path.

## Decision 4: Keep manual deploy validation for feature branches
- **Context:** Need safe pre-merge deployment verification.
- **Decision:** Add `workflow_dispatch` input-controlled `deploy_validation` path on non-master branches.
- **Impact:** Deployment logic can be validated without weakening protected deploy policy.

## Decision 5: Split Kubernetes config policy by scope
- **Context:** Local deploy-validation compatibility required overlay adjustments.
- **Decision:** Keep blocking Trivy config gate on `deployment/kubernetes/base`; scan local overlay non-blocking.
- **Impact:** Maintains strict baseline hardening while preserving CI validation operability.

## Decision 6: Prioritize correctness over speed in build/test jobs
- **Context:** Speed optimizations (`--ignore-scripts`) broke native dependencies.
- **Decision:** Ensure runtime/test jobs execute install scripts and rebuild required native bindings.
- **Impact:** Stable test reliability with controlled performance tradeoff.

## Decision 7: Keep evidence artifacts and robust upload behavior
- **Context:** Missing artifact paths created brittle pipelines.
- **Decision:** Add file-existence checks and conditional SARIF/log uploads.
- **Impact:** Better forensic value without introducing false pipeline failures.

## Decision 8: Honest risk framing
- **Context:** App is intentionally vulnerable by lineage.
- **Decision:** Position repository as a strong DevSecOps/AppSec control framework around inherited risk, not a fully secure product.
- **Impact:** Accurate portfolio narrative and credible security posture communication.
