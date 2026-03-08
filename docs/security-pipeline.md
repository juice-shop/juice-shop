# Security Pipeline

## Active GitHub Actions Workflows

- `build-test.yml`: install, lint, build, server/API tests, and smoke startup check.
- `codeql-analysis.yml`: semantic static analysis for JavaScript/TypeScript.
- `sast-secrets.yml`: Semgrep SAST, Gitleaks (new commit range), Trivy dependency scan.
- `container-scan.yml`: container image vulnerability reporting + configuration misconfiguration gate.
- `sbom-sign.yml`: Syft CycloneDX SBOM generation and optional keyless Cosign signing.
- `dast-zap.yml`: starts local app and runs OWASP ZAP baseline against `http://127.0.0.1:3000`.
- `deploy-k8s.yml`: manifest validation and optional deployment to local Kind cluster.

## Pipeline Design Notes

- Upstream release/bot maintenance workflows are archived under `legacy/ci/`.
- External SaaS integrations (Coveralls/Cypress dashboard/Slack/Heroku deployment) are removed from active CI.
- DAST no longer scans third-party preview infrastructure.
- Workflows using Node explicitly pin Node.js `22`.

## Fail Gates

- Semgrep: fails on newly introduced findings when baseline commit is available.
- Gitleaks: fails on detected secrets in the current PR/push commit range.
- Trivy config scan: fails on HIGH/CRITICAL Dockerfile/Kubernetes misconfigurations.
- Trivy dependency/image vulnerability scans are report-focused due intentionally vulnerable baseline characteristics.

## Artifacts Produced

- SARIF reports for Semgrep, Gitleaks, Trivy.
- ZAP HTML/JSON/Markdown report bundle.
- Syft CycloneDX SBOM JSON.
- Optional Cosign signature and certificate for SBOM blob.
- Kubernetes deployment diagnostics for Kind runs.

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
