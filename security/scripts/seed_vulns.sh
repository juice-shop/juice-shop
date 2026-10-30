#!/usr/bin/env bash
# Creates a demo branch with 9 deliberately seeded vulnerabilities, one or more per pipeline
# stage, and opens a PR. The pipeline should catch them BEFORE merge; the dashboard then reports
# the catch rate per stage against security/seeded_vulns.yaml.
#
#   bash security/scripts/seed_vulns.sh            # create branch, push, open PR (needs gh)
#   bash security/scripts/seed_vulns.sh --no-push  # only create the local branch
#
# NEVER merge this PR. The secrets below are random values generated on your machine; they are
# not real credentials, but treat the branch as compromised all the same and delete it after.
set -euo pipefail
BRANCH=demo/seeded-vulns
PUSH=1
[ "${1:-}" = "--no-push" ] && PUSH=0

rand() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$1"; }

git checkout -B "$BRANCH"

# SEED-1 SQL injection, SEED-2 command injection, SEED-3 reflected XSS, SEED-4 hard-coded key (SAST)
cat > routes/pfReport.ts <<EOF
/*
 * PipelineFortress SEEDED VULNERABILITIES. Demo branch only, never merge.
 * Each marked line is a deliberate, well-known bug used to measure which stage catches it.
 */
import { type Request, type Response } from 'express'
import { exec } from 'node:child_process'
import * as models from '../models/index'

const PAYMENT_API_KEY = 'pf_live_$(rand 32)' // SEED-4

export function pfReport () {
  return async (req: Request, res: Response) => {
    const [rows] = await models.sequelize.query(\`SELECT * FROM Products WHERE name LIKE '%\${String(req.query.q)}%'\`) // SEED-1
    exec('ping -c 1 ' + String(req.query.host), () => {}) // SEED-2
    res.send('<h1>Report for ' + String(req.query.name) + '</h1>' + JSON.stringify(rows) + String(PAYMENT_API_KEY.length)) // SEED-3
  }
}
EOF

# SEED-5 committed credentials file (secrets)
mkdir -p security/demo
cat > security/demo/integration.env <<EOF
# seeded secret for the PipelineFortress demo
PAYMENT_GATEWAY_API_KEY=$(rand 40)
DB_PASSWORD=$(rand 24)
EOF

# SEED-6 vulnerable dependency with a fix available, SEED-7 one with no fix (SCA)
# (sed instead of Python, so this also runs in Git Bash on Windows)
sed -i 's/^  "dependencies": {$/  "dependencies": {\n    "ejs": "3.1.6",\n    "node-serialize": "0.0.4",/' package.json
grep -q '"node-serialize": "0.0.4"' package.json || { echo "could not edit package.json" >&2; exit 1; }

# SEED-8 privileged container (IaC) - Pod Security "restricted" will also refuse it at deploy time
sed -i 's/allowPrivilegeEscalation: false/allowPrivilegeEscalation: true/; s/privileged: false/privileged: true/' security/k8s/deployment.yaml
grep -q 'privileged: true' security/k8s/deployment.yaml || { echo "could not edit deployment.yaml" >&2; exit 1; }

# SEED-9 unpinned third-party action with write-all token (supply chain, IaC stage)
cat > .github/workflows/pf-seeded-deploy.yml <<'EOF'
# SEEDED: never runs automatically (manual trigger only)
name: seeded-deploy
on: workflow_dispatch
permissions: write-all
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: some-vendor/deploy-action@v2
EOF

git add routes/pfReport.ts security/demo/integration.env package.json security/k8s/deployment.yaml .github/workflows/pf-seeded-deploy.yml
git commit -m "DEMO: seeded vulnerabilities for PipelineFortress catch-rate test (do not merge)"

if [ "$PUSH" = 1 ]; then
  git push -f -u origin "$BRANCH"
  command -v gh >/dev/null 2>&1 || { echo "Pushed. Now open your fork on GitHub and click 'Compare & pull request' for $BRANCH (base: master)."; exit 0; }
  gh pr create --head "$BRANCH" --title "DEMO: seeded vulnerabilities (do not merge)" \
    --body "Nine deliberately seeded vulnerabilities (see security/seeded_vulns.yaml). The PipelineFortress gates should block this PR. Close it after the demo." \
    || echo "PR exists already"
fi
echo "Seeded branch $BRANCH ready."
