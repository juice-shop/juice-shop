# Architecture Overview

This repository is a security-focused fork of OWASP Juice Shop, positioned as a DevSecOps/AppSec portfolio project.

## Application Components

- `app.ts` / `server.ts`: Node.js/Express application entry point and API surface.
- `frontend/`: Angular frontend served by the backend build output.
- `data/`, `models/`, `routes/`, `lib/`: core domain logic, challenge data, ORM models, and API handlers.
- `test/`: server and API tests (Mocha/Jest) plus smoke tests.
- `Dockerfile`: multi-stage container build with distroless runtime and non-root execution.

## Runtime Flow

1. Browser requests are served on TCP `3000`.
2. Express routes handle REST API endpoints under `/api` and `/rest`.
3. SQLite-backed persistence and challenge state are managed in app data directories.
4. Frontend assets are served as static content from the built Angular distribution.

## Delivery Architecture (Portfolio)

- GitHub Actions provides build, test, SAST, secret scanning, container scanning, SBOM generation/signing, DAST, and Kubernetes deployment validation.
- Node.js `22.x` is the standardized local and CI runtime baseline for this fork.
- Hardened Kubernetes manifests are provided in `deployment/kubernetes/`.
- Legacy upstream CI/CD and GitLab automation are archived under `legacy/ci/` and not active.

## Security Controls by Layer

- CI policy enforcement: `build_test` stage in `.github/workflows/devsecops-gated.yml`.
- Code analysis: CodeQL + Semgrep in `security_checks`.
- Secret detection: Gitleaks on push/PR commit ranges in `security_checks`.
- Dependency and container scanning: Trivy filesystem/image/config scans in `security_checks` and `container_build_and_scan`.
- SBOM + signing readiness: Syft + Cosign readiness artifacts in `security_checks`.
- DAST against repository-controlled target: local app instance + ZAP baseline in `dast`.
- Deployment hardening: non-root containers, read-only root filesystem, dropped capabilities, probes, resource limits, and network policy (`deployment/kubernetes/`).
