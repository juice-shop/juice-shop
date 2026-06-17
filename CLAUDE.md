# Security gate policy

## Gate verdict: BLOCKED

Block the PR (exit non-zero) if ANY of the following are true:

- One or more open Critical severity GHAS alerts exist on the PR branch
- One or more open High severity GHAS alerts exist on the PR branch
- An alert is dismissed with reason "won't fix" or no reason given
  (dismissed as "false positive" or "used in tests" may be exempt —
  use judgement based on the rule type and file location)

## Gate verdict: APPROVED

Approve only when ALL of the following are true:

- Zero open Critical alerts
- Zero open High alerts
- Any dismissed alerts were dismissed as "false positive" or "used in tests"
  with a plausible justification given the file path (e.g. a test fixture)

## Warnings (never block, always mention)

- Medium severity alerts → comment with remediation guidance
- Low severity alerts → list them but do not dwell on them
- Alerts in files under `/test`, `/e2e`, or `cypress/` paths →
  note them but treat with lower urgency

## Comment format

Start your PR comment with one of these headers so it is scannable:

> ## Security gate: BLOCKED
> ## Security gate: APPROVED (with warnings)
> ## Security gate: APPROVED

Follow with a findings table using this structure:

| Severity | Rule | File | Risk |
|---|---|---|---|

Then "What to fix" (for blocking findings) and "Warnings" sections.

## Context about this repo

This is OWASP Juice Shop — an intentionally vulnerable application used
for security training. Treat all findings as genuine for gate purposes;
do not dismiss them on the basis that the repo is a training target.