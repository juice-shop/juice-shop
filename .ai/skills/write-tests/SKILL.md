---
name: write-tests
description: Instructions for writing automated tests (frontend, server, API, Cypress E2E) that keep code coverage high for new functionality and close existing coverage gaps found in lcov.info files.
---

# Skill: Writing Automated Tests

This skill is the authoritative workflow for authoring automated tests in OWASP Juice Shop. Use it whenever you:

- add or change functionality and need to keep code coverage high, **or**
- are asked to *close existing coverage gaps* / *increase coverage*, **or**
- need to add a **Cypress E2E test for a challenge** that does not have one yet.

It is based on the project's four test suites and the companion guide's [Testing](https://pwning.owasp-juice.shop/companion-guide/latest/part3/contribution.html#_testing) section.

> **Golden rule:** Never weaken, skip, `@Disabled`/`it.skip`, or delete assertions to make a suite pass. Fix the code or the test instead. Do not chase 100 % — prioritize meaningful behavior, branches, and error paths over trivial getters.

---

## 1. The four test suites (know where each test lives)

| Suite | Location | Runner | Run command | Coverage command | lcov output |
| --- | --- | --- | --- | --- | --- |
| **Frontend unit** | `frontend/src/**/*.spec.ts` (next to the file under test) | Vitest via `@angular/build:unit-test` + `TestBed` | `npm run test:frontend` | `npm run test:frontend:coverage` | `frontend/coverage/lcov.info` |
| **Server unit** | `test/server/*.unit.test.ts` | Node.js built-in test runner (`node:test`) + `node:assert/strict` | `npm run test:server` | `npm run test:server:coverage` | `coverage/server-tests/lcov.info` |
| **API integration** | `test/api/*.test.ts` | Node.js built-in test runner + Supertest | `npm run test:api` | `npm run test:api:coverage` | `coverage/api-tests/lcov.info` |
| **E2E** | `test/cypress/e2e/*.spec.ts` | Cypress | `npm start & npm run test:e2e` | (not part of lcov coverage) | — |

`npm test` runs frontend + server + api. `npm run test:coverage` runs all three coverage variants.
The `nyc` config in `package.json` measures coverage for `lib/*.ts`, `models/*.ts`, `routes/*.ts`, and `server.ts` (server + api suites); the frontend suite measures the Angular sources (excluding `src/hacking-instructor/**`).

For **detailed, copy-ready patterns and real example files per suite, read the matching reference before writing:**

- Server unit → [`patterns/server.md`](./patterns/server.md)
- API integration → [`patterns/api.md`](./patterns/api.md)
- Frontend unit → [`patterns/frontend.md`](./patterns/frontend.md)
- Cypress E2E → [`patterns/cypress.md`](./patterns/cypress.md)

Always **imitate the closest existing test of the same suite** (naming, imports, structure, license header) instead of inventing a new style.

---

## 2. Coverage-first workflow (closing gaps)

Use this when the task is "increase/keep coverage" or "close the gaps".

### 2.1 Generate fresh coverage
```bash
npm run test:coverage
```
Run a single suite instead (`npm run test:server:coverage`, `npm run test:api:coverage`, `npm run test:frontend:coverage`) when you only care about one area — it is much faster.

### 2.2 Pick up *all* `lcov.info` files
Coverage is written to more than one place, so **search the whole repo** rather than assuming a single file:
```bash
# PowerShell
Get-ChildItem -Path . -Recurse -Filter lcov.info -File | Where-Object { $_.FullName -notmatch 'node_modules' } | Select-Object -ExpandProperty FullName
# bash
find . -name lcov.info -not -path '*/node_modules/*'
```
Expect up to three: `coverage/server-tests/lcov.info`, `coverage/api-tests/lcov.info`, `frontend/coverage/lcov.info`.

### 2.3 Read the gaps from lcov
Each `lcov.info` is grouped per source file:
- `SF:<path>` — start of a file record.
- `DA:<line>,<hits>` — a line and how often it was hit. **`hits == 0` means an uncovered line.**
- `LF`/`LH` — total vs. hit lines; `BRF`/`BRH` — total vs. hit branches; `FNF`/`FNH` — functions.
- `BRDA:<line>,<block>,<branch>,<hits>` — a branch outcome (`-` or `0` hits = uncovered branch).

Compute per-file line coverage as `LH / LF` and branch coverage as `BRH / BRF`. Prioritize files where these are lowest **and** the file has meaningful logic.

> The `server-tests` and `api-tests` lcov files overlap (same source files). A line uncovered in *both* is a real gap; a line covered in one is already exercised somewhere.

### 2.4 Rank the easiest / highest-value gaps to close
Prefer gaps in this order (best first):
1. **Pure functions / helpers** in `lib/*.ts` with uncovered lines — trivial to unit-test in isolation → **server unit test**.
2. **Uncovered error/negative branches** (e.g. `catch` blocks, `if (!x) next(error)`, `400/401/500` responses) — a single extra case usually closes several branches.
3. **Route handlers** in `routes/*.ts` — test the HTTP contract → **API test** (or a server unit test if the handler is easily invoked with mock `req/res`, see `keyServer.unit.test.ts`).
4. **Angular services** (`frontend/src/app/Services/*.ts`) — easiest frontend wins via `HttpTestingController`.
5. **Angular components** — cover `ngOnInit`, output events, and error handling.

Skip / de-prioritize: generated files, thin pass-through code, `src/hacking-instructor/**` (already excluded), and anything requiring elaborate infrastructure for a single line.

### 2.5 Decide the test type
- Logic in `lib/` reachable without HTTP, or a handler drivable with fake `req/res/next` → **server unit test**.
- Behavior only observable through an HTTP endpoint / needs the DB / auth flow → **API integration test**.
- Angular service, component, pipe, guard, or directive → **frontend unit test**.
- End-to-end user journey, or **a challenge's solve flow** → **Cypress E2E** (see §4).

When two types could work, choose the **fastest and most isolated** one that still exercises the real branch (unit > api > e2e).

### 2.6 Write, run, iterate
Write the smallest test that covers the target lines/branches, then re-run that suite's coverage and confirm the previously-zero `DA`/`BRDA` entries now have hits. Repeat for the next ranked gap.

---

## 3. Coverage-when-adding-functionality workflow

When you implement a new feature or fix a bug, tests are **part of the change**, not an afterthought:

1. **Bug fix** → first add a failing test (server/api/frontend as appropriate) that reproduces the bug, then fix the code and watch it pass.
2. **New feature** → add tests covering the happy path, at least one negative/invalid-input case, and edge cases. Pick the suite closest to where the logic lives (§2.5).
3. **New/changed challenge** → an E2E solve test is required (§4).
4. Re-run the relevant coverage command and make sure your new lines/branches are hit — new code must not *lower* overall coverage.
5. Follow every existing convention of the neighboring tests; extract nothing into shared helpers unless the suite already has them (`test/api/helpers/`, `test/cypress/support/`).

---

## 4. Cypress E2E for challenges (including challenges without one)

**Decision:** authoring E2E solve tests lives in **this** skill (it is a testing concern). The [verify-challenge skill](../verify-challenge/SKILL.md) only *checks that* an E2E test exists and that `disabledEnv` gating is correct — it defers the "how to write it" to here.

To add an E2E test for a challenge that lacks one:

1. Identify the challenge `key` and `name` in `data/static/challenges.yml`.
2. Find the most similar existing spec in `test/cypress/e2e/` (group by attack type: direct URL access → `directAccess.spec.ts`, injection → `noSql.spec.ts`/`search.spec.ts`, auth → `login.spec.ts`, etc.) and mirror it.
3. Perform the solving interaction with Cypress (`cy.visit`, `cy.request`, `cy.get(...).type/click`, `cy.login({...})`), then assert with the custom command:
   ```typescript
   cy.expectChallengeSolved({ challenge: 'Exact Challenge Name From challenges.yml' })
   ```
4. If the challenge has `disabledEnv`, wrap it so it is skipped where disabled (mirror the API-side guard in `patterns/api.md`).
5. Run it: `npm start & npm run test:e2e` (Cypress needs the app running, Chrome, and internet access, per the companion guide).

Full patterns and the available custom commands are in [`patterns/cypress.md`](./patterns/cypress.md).

---

## 5. Before you finish (mandatory)

- [ ] New/changed logic has tests in the correct suite; targeted coverage gaps now show non-zero hits in the regenerated `lcov.info`.
- [ ] All touched suites pass locally (`npm run test:server` / `test:api` / `test:frontend`, and `npm run test:e2e` for challenge work).
- [ ] `npm run lint` passes (JS Standard Style). Skip only if you edited *just* `REFERENCES.md`/`SOLUTIONS.md`.
- [ ] If you modified source inside a `// vuln-code-snippet` block, run `npm run rsn` (see [verify-rsn-fix skill](../verify-rsn-fix/SKILL.md)).
- [ ] No AI noise: remove throwaway `console.log`, obvious comments, and dead code.
- [ ] Each new test file starts with the standard copyright header used across the suite.

See [`checklists/testing-checklist.md`](./checklists/testing-checklist.md) for the full checklist.
