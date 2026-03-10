# Runtime Hardening Notes

## Objective
Document runtime hardening measures applied without breaking the inherited application behavior.

## Container/runtime controls in place
- Non-root execution (`runAsNonRoot`, specific UID/GID in Kubernetes manifests).
- Dropped Linux capabilities (`drop: ["ALL"]`).
- `allowPrivilegeEscalation: false`.
- Seccomp profile (`RuntimeDefault`).
- Resource requests/limits configured in Kubernetes deployment.
- NetworkPolicy included for cluster deployment path.

## Kubernetes hardening strategy
- `deployment/kubernetes/base` is treated as blocking policy surface in Trivy config scans.
- `deployment/kubernetes/overlays/local` includes deploy-validation compatibility adjustments and is scanned non-blocking.

Reason:
- The inherited app startup writes files at runtime in ways that conflict with strict immutable-root settings for this specific local validation path.
- Compatibility scope is bounded to local overlay while base policy remains strict.

## Node runtime policy
- CI runtime standardized on Node 22.
- App engine range supports Node `20 - 24`.
- Native module handling (e.g., `libxmljs2`) requires lifecycle scripts and reliable rebuild behavior in test jobs.

## Residual runtime risks
- The app itself includes intentional vulnerabilities (training lineage).
- Some upstream dependency deprecations/vulnerabilities remain inherited.
- Local deploy compatibility choices trade strictness for operational deploy-validation realism.

## Production migration direction
For enterprise production posture, prioritize:
1. Immutable runtime root filesystem with app changes to eliminate startup writes.
2. Signed artifact verification at deploy.
3. Runtime monitoring/detection and alerting integration.
4. Policy-as-code admission/enforcement in cluster environments.
