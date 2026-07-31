# Pattern: API integration tests (`test/api/*.test.ts`)

API tests boot the real Express app against an in-memory database and drive it with **Supertest**. They use the Node.js built-in runner and `node:assert/strict`, and run via `npm run test:api`. Use them when behavior is only observable through an HTTP endpoint, or requires the DB / auth flow.

## Skeleton

```typescript
/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'
import * as utils from '../../lib/utils'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api/Something', () => {
  void it('GET returns 200', async () => {
    const res = await request(app).get('/api/Something')
    assert.equal(res.status, 200)
  })
})
```

## Helpers (reuse, do not re-implement) — `test/api/helpers/`

- `createTestApp()` (`setup.ts`) → `{ app, sequelize }` with an in-memory DB (`createApp({ inMemoryDb: true })`). Always start the suite with a `before(...)` that assigns `app`, using a generous timeout (`{ timeout: 60000 }`).
- `login(app, { email, password, totpSecret? })` (`auth.ts`) → resolves the authentication object (handles the 2FA `totp_token_required` flow). Use `token`/`bid`/`umail` from the returned `authentication`.
- `register(app, { email, password, totpSecret? })` (`auth.ts`) → creates a user (and optionally enables 2FA).

## Auth headers

For a fixed admin/authorized token use `security.authorize()`:

```typescript
const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }
```

For a real user, log in and build the header from the token:

```typescript
const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
const res = await request(app)
  .get('/rest/basket/1')
  .set('Authorization', `Bearer ${token}`)
```

## Requests & assertions

```typescript
const res = await request(app)
  .post('/api/Feedbacks')
  .set(jsonHeader)
  .send({ comment: '...', rating: 1, captchaId, captcha })
assert.equal(res.status, 201)
assert.ok(res.headers['content-type']?.includes('application/json'))
assert.equal(res.body.data.comment, 'I am a harmless comment.')
```

Cover both happy paths **and** error paths (validation, constraint failures, wrong status codes) — negative cases usually close the most branches. Some endpoints require a captcha first: `GET /rest/captcha` then send `captchaId` + `captcha` (see `feedback.test.ts`).

## Challenge-gated tests

Wrap any assertion that depends on a challenge being enabled so it is skipped where the challenge is disabled:

```typescript
if (utils.isChallengeEnabled(challenges.persistedXssFeedbackChallenge)) {
  void it('POST fails to sanitize masked XSS-attack ...', async () => {
    // ...
  })
}
```

## Study these real examples

- **CRUD + sanitization + captcha + challenge gating** → `test/api/feedback.test.ts`.
- **Login / auth flows** → `test/api/login.test.ts`, `test/api/2fa.test.ts`.
- **Basket / authenticated user data** → `test/api/basket.test.ts`, `test/api/user.test.ts`.

Open the closest existing example and mirror its imports and structure before writing.
