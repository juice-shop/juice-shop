# Architecture Overview

## Scope
This repository contains an inherited Node/TypeScript web application with frontend assets and a security-focused GitHub Actions automation model.

## Runtime components
- Application server: Node.js (`build/app.js`) serving API and frontend assets.
- Data layer: SQLite (`data/juiceshop.sqlite`) and local data/content files.
- Container runtime: Docker image built from `Dockerfile`.
- Deployment validation/protected deploy target: ephemeral Kind Kubernetes cluster in CI.

## Delivery architecture
```mermaid
flowchart LR
  DEV[Feature branch change] --> CI[GitHub Actions: gated pipeline]
  CI --> PR[Pull Request checks]
  PR --> MERGE[Merge to master]
  MERGE --> PROTECTED[Master push pipeline]
  PROTECTED --> DEPLOY[Protected deploy job]
  CI --> MANVAL[Manual deploy_validation path]
```

## Trust boundaries (high-level)
```mermaid
flowchart TD
  A[Developer workstation] --> B[GitHub repository]
  B --> C[GitHub-hosted runners]
  C --> D[Security scanners + test execution]
  C --> E[Kind cluster deploy validation]

  subgraph Controlled by this repo
    B
    C
    E
  end
```

## Key design intent
- Keep security and quality controls before deployment paths.
- Separate protected deploy from feature-branch deploy validation.
- Preserve evidence artifacts for diagnostics and review.
- Use explicit risk boundaries where inherited app behavior conflicts with strict hardening.

## Inherited-app reality
The application lineage is intentionally vulnerable for security training. The architecture work here demonstrates process hardening, governance, and risk management around such a codebase.
