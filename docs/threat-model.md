# Threat Model

## Scope

This threat model covers operation of this fork as a training application plus portfolio-grade security automation.

## Assets

- Source code and workflow definitions.
- Build artifacts and container images.
- SBOM and scan reports.
- Application data and challenge state at runtime.
- CI credentials and OIDC identity used for signing.

## Trust Boundaries

- Developer workstation to GitHub repository.
- GitHub-hosted runners to external package registries.
- Container runtime to host kernel.
- Kubernetes namespace boundary (`juice-shop`) and cluster networking.

## Attack Surface

- Public HTTP service on port `3000`.
- Express API endpoints (`/api`, `/rest`, `/socket.io`).
- Container image supply chain (base image, dependencies).
- CI workflow execution and third-party actions.
- Kubernetes manifests and runtime policy configuration.

## Threats and Mitigations

1. Supply-chain compromise in dependencies
- Mitigations: CodeQL, Semgrep, Trivy filesystem/image scans, SBOM generation.

2. Secret leakage in commits
- Mitigations: Gitleaks against commit ranges on push/PR, SARIF reporting in GitHub security tab.

3. Insecure runtime privileges in container/orchestration
- Mitigations: non-root user, dropped Linux capabilities, `readOnlyRootFilesystem`, `seccompProfile`, `automountServiceAccountToken: false`.

4. Unverified deployment configuration drift
- Mitigations: manifest rendering/validation workflow and optional deploy-to-Kind smoke test.

5. DAST scanning of third-party environments
- Mitigations: ZAP baseline now targets a locally started instance controlled by this repo.

## Security Assumptions

- The application remains intentionally vulnerable for training and challenge purposes.
- Vulnerability scans are used primarily to detect drift and new risk introduction in this fork.
- Secret and SAST gating focuses on newly introduced issues rather than historical upstream content.

## Residual Risks

- Intentional vulnerabilities remain by design.
- Dependency vulnerability volume can be high in intentionally vulnerable training software.
- Workflow security still depends on secure maintenance of pinned actions and runner trust.
