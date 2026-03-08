# Security Pipeline

## Active GitHub Actions Workflow

- `devsecops-gated.yml` runs one gated pipeline with these stages:
  - `build_test`: install, lint, build server/frontend, server/API tests, and startup smoke test.
  - `security_checks`: CodeQL, Semgrep, Gitleaks, Trivy filesystem scan, SBOM generation, and Cosign readiness artifact.
  - `container_build_and_scan`: container image build, Trivy image scan, and Trivy config scans for Dockerfile/Kubernetes assets.
  - `dast`: starts a local app instance and runs OWASP ZAP baseline against `http://127.0.0.1:3000`.
  - `deploy`: deploys to a local Kind cluster and runs smoke verification (main branch only).

## Pipeline Design Notes

- Triggered on `push` (all branches), `pull_request`, and `workflow_dispatch`.
- Job dependencies enforce this chain:
  `build_test -> security_checks -> container_build_and_scan -> dast -> deploy`.
- Deploy runs only when `github.ref == refs/heads/main` and event is not `pull_request`.
- Workflow jobs that execute Node are pinned to Node 22, while root package engines allow `20 - 24` for upstream compatibility.
- Legacy upstream and GitLab pipelines are archived under `legacy/ci/` and are not active.

## Fail Gates

- Build/lint/tests must pass before security stages run.
- Semgrep fails on findings in the current baseline delta.
- Gitleaks fails when secrets are detected in the current commit range.
- Trivy config scans fail on HIGH/CRITICAL Dockerfile or Kubernetes misconfigurations.
- Deploy is skipped if any prerequisite stage fails or branch/event conditions do not match.

## Dependency Risk Note

- This project inherits intentionally vulnerable and deprecated dependencies from upstream Juice Shop.
- Pipeline handling includes:
  - SARIF output from CodeQL, Semgrep, Gitleaks, and Trivy.
  - SBOM generation via Syft (CycloneDX JSON).
  - Signing readiness evidence via Cosign tooling.
  - Misconfiguration gating for Dockerfile and Kubernetes manifests.
- Dependency vulnerability scans are report-focused to support this training baseline while still surfacing drift.

## Local Validation Commands

```bash
# Workflow linting
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.7

# Kubernetes manifest validation
docker run --rm -v "$PWD:/work" -w /work bitnami/kubectl:latest kustomize deployment/kubernetes/overlays/local > /tmp/juice-shop-k8s.yaml
docker run --rm -v /tmp:/tmp ghcr.io/yannh/kubeconform:latest -strict -summary /tmp/juice-shop-k8s.yaml

# Containerized smoke test
docker compose -f docker-compose.test.yml up --exit-code-from sut
```
