#!/usr/bin/env bash
# Iteratively migrates all remaining Frisby test files in test/api/ to Supertest
# by launching Claude Code with the migrate-api-test skill for each one.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

remaining=$(ls test/api/*Spec.ts 2>/dev/null | wc -l | tr -d ' ')

if [ "$remaining" -eq 0 ]; then
  echo "No test suites left in test/api/ — migration complete!"
  exit 0
fi

echo "$remaining test suite(s) remaining in test/api/:"
ls test/api/*Spec.ts
echo ""

while [ "$(ls test/api/*Spec.ts 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ]; do
  next=$(ls test/api/*Spec.ts | head -1)
  echo "==> Migrating: $next"
  claude \
    --allowedTools \
      "Read" \
      "Write" \
      "Edit" \
      "Glob" \
      "Grep" \
      "Bash(NODE_ENV=test node --import tsx --test --test-force-exit *)" \
      "Bash(npm run test:api:supertest)" \
      "Bash(rm test/api/*)" \
    -p /migrate-api-test
  echo "==> Done with migration step. Remaining: $(ls test/api/*Spec.ts 2>/dev/null | wc -l | tr -d ' ') file(s)"
  echo ""
done

echo "All test suites migrated!"
