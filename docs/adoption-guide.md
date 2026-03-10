# Adoption Guide: Applying This Model in an Organization

## Audience
Engineering, platform, and security teams that want to implement a gated DevSecOps/AppSec model in their own repositories.

## 1) Start with repository and risk onboarding
- Inventory inherited CI/CD, deployment paths, and security tooling.
- Identify what is authoritative, what is obsolete, and what is externally coupled.
- Define explicit risk ownership and acceptance boundaries before pipeline enforcement.

## 2) Establish a single CI/CD control plane
- Consolidate active workflows in one platform.
- Archive legacy automation for traceability.
- Name jobs by stage intent (`build_test`, `security_checks`, etc.) to support governance and review.

## 3) Implement a gated stage model
Recommended order:
1. build and tests,
2. code and dependency security checks,
3. container and IaC checks,
4. DAST,
5. deploy.

Key policy:
- Deploy must depend on successful upstream stages.
- PR pipelines should never execute protected production deploy.

## 4) Define branch protection and required checks
- Protect the release/default branch.
- Require explicit status checks mapped to gate stages.
- Require reviews.
- Prefer strict “up-to-date before merge” where practical.

## 5) Define severity thresholds and exception governance
- Document fail thresholds by tool/severity.
- Separate blocking findings from non-blocking advisory findings.
- Introduce formal exceptions with owner, expiry, and compensating controls.
- Keep suppressions narrow and file/rule scoped.

## 6) Adapt DAST targets safely
- Scan environments controlled by your repository/team.
- Avoid scanning third-party demos/previews.
- Add startup readiness checks and deterministic scan targets.
- Store reports/artifacts for review and trend analysis.

## 7) Move from demo/portfolio model to production model
Add progressively:
- Environment protection rules and manual approvals.
- Preview environments with isolated data and secrets.
- Signed artifact attestation and verification at deploy.
- Runtime detection, audit logging, and alerting integrations.
- Policy-as-code controls for deployment and cluster admission.

## 8) Suggested rollout plan
1. Pilot on one service/repo.
2. Baseline false positives and tune policy.
3. Enable required checks.
4. Add deployment environment protections.
5. Scale as a reusable template across teams.

## 9) Common pitfalls
- Treating tool output as policy without ownership.
- Speed optimizations that break correctness.
- Broad suppressions to “make CI green.”
- Missing governance docs for accepted risk and exceptions.

## 10) Evidence and audit expectations
For each release candidate, retain:
- pipeline run references,
- scanner outputs/SARIF,
- deploy diagnostics,
- exception decisions,
- branch protection configuration snapshot.
