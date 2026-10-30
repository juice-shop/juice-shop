#!/usr/bin/env bash
# One-time setup, run from the root of YOUR fork of OWASP Juice Shop after copying the
# PipelineFortress files into it.
#   bash security/scripts/setup_fork.sh
set -euo pipefail

if [ ! -f server.ts ] || [ ! -f package.json ] || ! grep -q '"name": "juice-shop"' package.json; then
  echo "Run this from the root of your Juice Shop fork." >&2
  exit 1
fi

echo "==> Disabling the upstream Juice Shop workflows (they need upstream secrets and would spam your fork)"
mkdir -p security/upstream-workflows-disabled
for f in .github/workflows/*.yml; do
  case "$(basename "$f")" in pipelinefortress.yml|pf-*.yml) continue ;; esac
  git mv -f "$f" "security/upstream-workflows-disabled/$(basename "$f").disabled" 2>/dev/null \
    || mv -f "$f" "security/upstream-workflows-disabled/$(basename "$f").disabled"
done

echo "==> Keeping security tooling out of the container image (.dockerignore)"
grep -qxF 'security/' .dockerignore 2>/dev/null || printf '\n# PipelineFortress tooling, never shipped in the image\nsecurity/\ntriage-out/\nscans/\nmetrics-out/\n' >> .dockerignore

echo "==> Ignoring local scan output (.gitignore)"
grep -qxF 'triage-out/' .gitignore 2>/dev/null || printf '\n# PipelineFortress local output\ntriage-out/\nscans/\nmetrics-out/\ncollected/\nzap/\n' >> .gitignore

chmod +x security/scripts/*.sh
echo
echo "Done. Next:"
echo "  1. git add -A && git commit -m 'Add PipelineFortress DevSecOps pipeline' && git push"
echo "  2. In GitHub: Settings > Secrets and variables > Actions > New repository secret: GEMINI_API_KEY"
echo "  3. Settings > Actions > General > Workflow permissions: tick"
echo "     'Allow GitHub Actions to create and approve pull requests'"
echo "  4. Watch the first run in the Actions tab. See security/RUN_GUIDE.md for the rest."
