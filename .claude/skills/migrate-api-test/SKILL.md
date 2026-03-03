---
name: migrate-api-test
description: Migrate a single Frisby API test file to Supertest with node:test. Use when asked to migrate a test from test/api/ to test/api-supertest/.
argument-hint: <source-spec-file>
disable-model-invocation: true
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob
---

Migrate the Frisby API test file `$ARGUMENTS` from `test/api/` to a Supertest-based test in `test/api-supertest/`.

## Step 1: Read the source file

Read the Frisby test file. If `$ARGUMENTS` doesn't include a path, look for it at `test/api/$ARGUMENTS`.

## Step 2: Reuse existing helpers

These helpers exist in `test/api-supertest/helpers/` - read them to understand their signatures:

- **`helpers/setup.ts`** - exports `createTestApp()` returning `{ app: Express, sequelize: Sequelize }` with an in-memory SQLite DB, pre-seeded with default data
- **`helpers/auth.ts`** - exports `login(app, { email, password, totpSecret? })` and `register(app, { email, password, totpSecret? })`

Do NOT create new helper files or modify existing ones.

## Step 3: Apply the migration pattern

### Imports

Replace:
```typescript
import * as frisby from 'frisby'
const Joi = frisby.Joi
const REST_URL = 'http://localhost:3000/rest'
const API_URL = 'http://localhost:3000/api'
```
With:
```typescript
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import type { Sequelize } from 'sequelize'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'  // only if needed
```

Only import what's actually used. Keep imports like `config`, `jwt`, `otplib`, `security` if the original uses them.

### Test structure

- Replace `describe`/`it` with `void describe`/`void it` (from `node:test`, `void` is required)
- Add top-level `before`/`after` for app lifecycle:

```typescript
let app: Express
let db: Sequelize

before(async () => {
  const result = await createTestApp()
  app = result.app
  db = result.sequelize
}, { timeout: 60000 })

after(async () => {
  await db?.close()
})
```

### HTTP calls

| Frisby | Supertest |
|--------|-----------|
| `frisby.get(URL, { headers })` | `request(app).get(path).set(headers)` |
| `frisby.post(URL, { headers, body })` | `request(app).post(path).set(headers).send(body)` |
| `frisby.put(URL, { headers, body }, { json: true })` | `request(app).put(path).set(headers).send(body)` |
| `frisby.del(URL, { headers })` | `request(app).delete(path).set(headers)` |

- Remove base URLs - Supertest uses the app directly
- `REST_URL + '/path'` becomes `'/rest/path'`
- `API_URL + '/path'` becomes `'/api/path'`

### Assertions

| Frisby | Supertest + assert |
|--------|-------------------|
| `.expect('status', 200)` | `assert.equal(res.status, 200)` |
| `.expect('header', 'content-type', /json/)` | `assert.ok(res.headers['content-type']?.includes('application/json'))` |
| `.expect('json', { key: val })` | `assert.equal(res.body.key, val)` |
| `.expect('json', 'path', { key: val })` | `assert.equal(res.body.path.key, val)` |
| `Joi.string()` | `assert.equal(typeof val, 'string')` |
| `Joi.number()` | `assert.equal(typeof val, 'number')` |
| `Joi.boolean()` | `assert.equal(typeof val, 'boolean')` |
| `Joi.array()` | `assert.ok(Array.isArray(val))` |

### Authentication

Replace inline login code with `helpers/auth.ts`:

```typescript
// Before (frisby beforeAll)
beforeAll(() => {
  return frisby.post(REST_URL + '/user/login', { headers, body: { email, password } })
    .expect('status', 200)
    .then(({ json }) => { authHeader = { Authorization: 'Bearer ' + json.authentication.token, ... } })
})

// After (supertest before)
before(async () => {
  const result = await createTestApp()
  app = result.app
  db = result.sequelize
  const { token } = await login(app, { email, password })
  authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
}, { timeout: 60000 })
```

### Lifecycle hooks

- `beforeAll` -> `before` (from `node:test`)
- `afterAll` -> `after`
- Nested `beforeAll` inside `describe` -> nested `before` inside `void describe`

### Cleanup

- Remove all `// @ts-expect-error FIXME promise return handling broken` comments
- Remove `const Joi = frisby.Joi`
- Remove URL constants (`REST_URL`, `API_URL`)

## Step 4: File naming

- Source: `test/api/<name>Spec.ts` (e.g., `addressApiSpec.ts`)
- Target: `test/api-supertest/<name>.test.ts` (e.g., `address.test.ts`)
- Strip `Spec` suffix and `Api` infix, use kebab-case

## Step 5: Copyright header

Every file must start with:
```typescript
/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
```

## Step 6: Validate

Before finishing you need to confirm that that test is working!

Run the test:
```bash
node --import tsx --test --test-force-exit test/api-supertest/<name>.test.ts
```

If tests fail, read the error output and fix. Common issues:
- Timeout: increase `before` timeout or individual test timeout
- Auth failures: verify login credentials match seeded data
- Wrong status codes: in-memory DB may behave slightly differently

## Important constraints

- Do NOT modify `server.ts`, `models/index.ts`, `package.json`, or helper files
- Do NOT create new helper files
- Keep test descriptions identical to originals
- Preserve full test coverage - don't skip tests
- Each test file gets its own `createTestApp()` / `db.close()` lifecycle
