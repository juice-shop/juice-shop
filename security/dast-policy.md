## DAST Baseline Policy

Active DAST scanning runs in `.github/workflows/devsecops-gated.yml` using `zap-baseline.py` against `http://127.0.0.1:3000` and the policy file `.zap/rules.tsv`.

### Current policy decisions

- `Private IP Disclosure [2]`: **fixed in code**.
  - Root cause: `/rest/admin/application-configuration` exposed private-IP OAuth redirect URIs from upstream default configuration (for example `127.0.0.1` and `192.168.99.100`).
  - Remediation: `routes/appConfiguration.ts` now removes private-IP redirect entries from the public configuration response.
  - Residual risk: low. The endpoint still exposes non-private configuration values by design.

- `Full Path Disclosure [110009]`: **accepted inherited risk** for this fork.
  - Root cause: upstream challenge behavior intentionally returns stack traces on `/ftp` error paths (for example `/ftp/easter.egg`) via Express `errorhandler`, including absolute file paths.
  - Policy handling: `.zap/rules.tsv` sets `110009` to `INFO` (not ignored) with an explicit rationale.
  - Residual risk: moderate information disclosure if the same behavior exists in internet-facing deployments.

### Guardrails

- No broad warning suppression was added.
- Only alert `110009` was downgraded, and only after documenting its intentional upstream challenge behavior.
- Other warning/fail rules remain active to preserve security signal in CI.
