#!/usr/bin/env bash
# Run the same scanners as the pipeline on your laptop (needs Docker and Python 3).
# Windows: run inside WSL2 or Git Bash with Docker Desktop running.
#
#   bash security/scripts/local_scan.sh            # secrets, SAST, SCA, IaC + offline triage
#   bash security/scripts/local_scan.sh --image    # also build the image, Trivy image scan + Syft SBOM
#   GEMINI_API_KEY=... bash security/scripts/local_scan.sh   # use the real LLM for triage
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
mkdir -p scans metrics-out
export PYTHONPATH=security/triage
python3 -c "import yaml" 2>/dev/null || python3 -m pip install --user -r security/triage/requirements.txt

GITLEAKS=zricethezav/gitleaks:v8.30.1
SEMGREP=semgrep/semgrep:1.182.1
TRIVY=ghcr.io/aquasecurity/trivy:0.72.0
CHECKOV=bridgecrew/checkov:3.3.30
SYFT=anchore/syft:v1.49.0
gate() { PF_STAGE_START=$1 python3 -m pftriage gate --stage "$2" --tool "$3" --input "$4" --no-fail | head -3; }

t=$(date +%s); echo "==> 1/4 secrets (gitleaks)"
docker run --rm -v "$PWD:/repo" "$GITLEAKS" dir /repo --config /repo/security/gitleaks.toml --redact --no-banner \
  --report-format json --report-path /repo/scans/gitleaks.json --exit-code 0
gate "$t" secrets gitleaks scans/gitleaks.json

t=$(date +%s); echo "==> 2/4 SAST (Semgrep)"
docker run --rm -v "$PWD:/src" -w /src "$SEMGREP" semgrep scan --metrics=off --timeout 30 \
  --config p/javascript --config p/typescript --config p/nodejs --config p/owasp-top-ten \
  --config security/semgrep/pipelinefortress.yml --json-output=scans/semgrep.json --quiet
gate "$t" sast semgrep scans/semgrep.json

t=$(date +%s); echo "==> 3/4 SCA (Trivy on generated lockfiles)"
npm install --package-lock-only --package-lock=true --ignore-scripts --no-audit --no-fund >/dev/null
(cd frontend && npm install --package-lock-only --package-lock=true --ignore-scripts --no-audit --no-fund --legacy-peer-deps >/dev/null)
docker run --rm -v "$PWD:/src" -v "$HOME/.cache/trivy:/root/.cache/trivy" "$TRIVY" fs --scanners vuln \
  --format json --output /src/scans/trivy-fs.json /src
rm -f package-lock.json frontend/package-lock.json
gate "$t" sca trivy scans/trivy-fs.json

t=$(date +%s); echo "==> 4/4 IaC (Checkov + PF policies)"
docker run --rm -v "$PWD:/src" -w /src "$CHECKOV" -d . --framework kubernetes,dockerfile,terraform,github_actions \
  --external-checks-dir security/checkov/policies --skip-path data/static/codefixes --skip-path node_modules \
  --skip-path frontend --skip-path test --skip-download --soft-fail -o json > scans/checkov.json
gate "$t" iac checkov scans/checkov.json

if [ "${1:-}" = "--image" ]; then
  t=$(date +%s); echo "==> container: build, Trivy image, Syft SBOM"
  docker build -f security/Dockerfile.hardened -t pipelinefortress/juice-shop:ci .
  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/scans:/out" \
    -v "$HOME/.cache/trivy:/root/.cache/trivy" "$TRIVY" image --scanners vuln,secret --format json \
    --output /out/trivy-image.json pipelinefortress/juice-shop:ci
  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/scans:/out" "$SYFT" \
    docker:pipelinefortress/juice-shop:ci -o cyclonedx-json=/out/sbom.cdx.json -o spdx-json=/out/sbom.spdx.json
  gate "$t" container trivy scans/trivy-image.json
fi

echo "==> triage + dashboard"
python3 -m pftriage triage --input scans --out triage-out
python3 -m pftriage verify-audit --dir triage-out/llm_audit
[ -f security/ground_truth.yaml ] && python3 -m pftriage evaluate --out triage-out/evaluation.md >/dev/null
python3 security/metrics/build_dashboard.py --scans scans --metrics metrics-out --triage triage-out
echo "Open triage-out/dashboard.html and triage-out/triage.md"
