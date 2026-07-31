# Automated Testing Checklist

Use this checklist when adding tests, adding functionality, or closing coverage gaps.

## 1. Scope & suite choice
- [ ] The change's logic is tested in the **correct suite**: `lib`/pure logic → server unit; HTTP/DB/auth behavior → API; Angular service/component → frontend unit; challenge solve flow / user journey → Cypress E2E.
- [ ] Chose the fastest, most isolated suite that still exercises the real branch (unit > api > e2e).

## 2. Coverage
- [ ] Regenerated coverage (`npm run test:coverage` or the single-suite variant).
- [ ] Collected **all** `lcov.info` files (`coverage/server-tests/`, `coverage/api-tests/`, `frontend/coverage/`).
- [ ] Targeted lines/branches that were `DA:...,0` / uncovered `BRDA` now show non-zero hits.
- [ ] New code does not lower overall line/branch coverage.
- [ ] Prioritized meaningful branches and error/negative paths, not trivial getters, and did not chase 100 %.

## 3. Test quality
- [ ] Followed the neighboring tests' style, imports, and structure (mirrored the closest existing example).
- [ ] License/copyright header present at the top of each new test file.
- [ ] Happy path **and** at least one negative/edge case covered for new logic.
- [ ] Reused existing helpers (`test/api/helpers/`, `test/cypress/support/`) instead of re-implementing.
- [ ] Challenge-dependent assertions wrapped in `utils.isChallengeEnabled(...)` (API) or the equivalent gate (E2E) when `disabledEnv` applies.
- [ ] No AI noise (throwaway `console.log`, obvious comments, dead code).

## 4. Challenge E2E (if applicable)
- [ ] Uses `cy.expectChallengeSolved({ challenge: '<exact name from challenges.yml>' })`.
- [ ] Correct interaction chosen (`cy.request` for non-HTML/file access, `cy.visit`/`cy.get` for UI, `cy.login` for auth).

## 5. Run & verify
- [ ] All touched suites pass locally (`npm run test:server` / `test:api` / `test:frontend`; `npm start & npm run test:e2e` for challenge work).
- [ ] `npm run lint` passes (skip only if you edited *just* `REFERENCES.md`/`SOLUTIONS.md`).
- [ ] `npm run rsn` run if source inside a `// vuln-code-snippet` block changed.
