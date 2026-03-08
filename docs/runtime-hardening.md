# Runtime Hardening

## Container Runtime

The application container already runs with strong baseline controls:

- Distroless runtime image.
- Non-root execution (`USER 65532`).
- Minimal runtime command surface.

Additional repository hardening:

- Container scanning workflow (`container-scan.yml`) validates both vulnerabilities and configuration posture.
- `.dockerignore` is tightened to reduce unnecessary build context and accidental artifact inclusion.

## Kubernetes Hardening

Hardened manifests live in `deployment/kubernetes/` with:

- Dedicated namespace (`juice-shop`).
- `automountServiceAccountToken: false`.
- `runAsNonRoot`, fixed UID/GID, and dropped capabilities.
- `readOnlyRootFilesystem: true`.
- `seccompProfile: RuntimeDefault`.
- Explicit resource requests and limits.
- Liveness/readiness probes.
- `NetworkPolicy` ingress restriction to app port.
- Ephemeral writable mounts (`emptyDir`) for required write paths (`data`, `logs`, `uploads`, `/tmp`).

## Local Deployment Path (Kind)

```bash
kind create cluster --name juice-shop
docker build -t juice-shop:kind .
kind load docker-image juice-shop:kind --name juice-shop
kubectl apply -k deployment/kubernetes/overlays/local
kubectl -n juice-shop rollout status deployment/juice-shop
kubectl -n juice-shop port-forward svc/juice-shop 3000:3000
```

Then open `http://localhost:3000`.

## Security Tradeoffs

- `readOnlyRootFilesystem` is enabled, but writable app paths are explicitly mounted.
- Network policy is ingress-focused for local usability; stricter egress policy can be layered later.
- This project intentionally includes vulnerable code for training, so hardening focuses on infrastructure posture and secure delivery controls.
