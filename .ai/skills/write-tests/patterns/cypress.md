# Pattern: Cypress E2E tests (`test/cypress/e2e/*.spec.ts`)

E2E tests drive the running application in a real browser with **Cypress**. They are the required test type for **new or changed challenges** (a test that proves the challenge can be solved). Run them with the app up:

```bash
npm start & npm run test:e2e
```

Cypress needs the app reachable at its base URL, Chrome, and internet access (per the companion guide). Files live in `test/cypress/e2e/` and end with `.spec.ts`.

## Challenge solve-test skeleton

```typescript
describe('/', () => {
  describe('challenge "myNewChallenge"', () => {
    it('should be solvable by <doing the exploit>', () => {
      // 1. perform the exploit
      cy.visit('/#/some-page')
      cy.get('#someInput').type("' or 1=1--")
      cy.get('#submitButton').click()

      // 2. assert the challenge flips to solved
      cy.expectChallengeSolved({ challenge: 'My New Challenge' })
    })
  })
})
```

The `challenge` value passed to `cy.expectChallengeSolved` is the **exact `name`** from `data/static/challenges.yml`, not the `key`.

## Custom commands (defined in `test/cypress/support/commands.ts`)

- `cy.expectChallengeSolved({ challenge: '<Challenge Name>' })` — polls `GET /api/Challenges/?name=...` and asserts `solved === true` (retries once after 2 s). **This is the assertion for every challenge test.**
- `cy.login({ email, password, totpSecret? })` — logs in through the UI (handles bare usernames by appending the configured domain).
- `cy.eachSeries(array, cb)` — iterate sequentially over async steps.

## Choosing the interaction

- **Direct URL / file access** (no HTML response, e.g. images, logs, JSON): use `cy.request('/path')` — `cy.visit` fails on non-HTML or non-2xx responses. See `directAccess.spec.ts` (uses `cy.request` for images/logs and `cy.visit(url, { failOnStatusCode: false })` when needed).
- **UI-driven exploit**: `cy.visit`, then `cy.get(...).type(...)`, `cy.get(...).click()`, and `cy.login(...)` for authenticated flows.
- **Tasks/fixtures**: dynamic data comes from `cy.task<...>('GetBlueprint')`, `cy.task<Date>('toISO8601')`, `cy.task('GetFromConfig', 'application.domain')` (tasks are registered in `cypress.config.ts`).
- Suppress known uncaught app exceptions only when a similar existing test already does (`cy.on('uncaught:exception', ...)`, as in `directAccess.spec.ts`).

## `disabledEnv` gating

If the challenge sets `disabledEnv` in `challenges.yml`, guard the test so it does not run where the challenge is disabled (same idea as the API `utils.isChallengeEnabled` guard). Mirror how an existing spec for a similarly-gated challenge does it, and confirm gating with the [verify-challenge skill](../verify-challenge/SKILL.md).

## Group tests by attack type — pick the closest existing spec to mirror

- Direct URL / file access → `directAccess.spec.ts`, `publicFtp.spec.ts`
- Injection (SQL / NoSQL / search) → `search.spec.ts`, `noSql.spec.ts`
- Authentication / JWT → `login.spec.ts`, `forgedJwt.spec.ts`
- Account / profile flows → `profile.spec.ts`, `changePassword.spec.ts`, `register.spec.ts`
- REST API misuse → `restApi.spec.ts`

If a spec already exists for the challenge's feature area, add a new `describe('challenge "..."')` block to it rather than creating a new file.

Always open the closest existing spec and mirror its structure and commands before writing.
