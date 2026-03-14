---
name: migrate-api-test
description: Migrate the next unmigrated Frisby API test file to Supertest with node:test. Automatically picks the first remaining file alphabetically.
disable-model-invocation: true
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

Migrate the next unmigrated Frisby API test file from `test/api/` to a Supertest-based test in `test/api-supertest/`.

## Step 1: Find the next file to migrate

List all `test/api/*Spec.ts` files and all `test/api-supertest/*.test.ts` files. Determine which Frisby files have NOT yet been migrated by checking if a corresponding supertest file exists. Use this naming mapping:

- `test/api/<name>Spec.ts` or `test/api/<name>ApiSpec.ts` → `test/api-supertest/<kebab-case-name>.test.ts`
- Strip `Spec` suffix and `Api` infix, convert camelCase to kebab-case

Pick the first unmigrated file alphabetically. If all files are migrated, tell the user and stop.

## Step 2: Read the source file and existing helpers

Read the Frisby test file identified in Step 1.

These helpers exist in `test/api-supertest/helpers/` - read them to understand their signatures:

- **`helpers/setup.ts`** - exports `createTestApp()` returning `{ app: Express }` with an in-memory SQLite DB, pre-seeded with default data
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
import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'  // only if needed
```

Only import what's actually used. Keep imports like `config`, `jwt`, `otplib`, `security` if the original uses them.

### Test structure

- Replace `describe`/`it` with `void describe`/`void it` (from `node:test`, `void` is required)
- Add top-level `before` for app setup (no `after` cleanup needed — `--test-force-exit` handles process exit):

```typescript
let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })
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
  const { token } = await login(app, { email, password })
  authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
}, { timeout: 60000 })
```

### Lifecycle hooks

- `beforeAll` -> `before` (from `node:test`)
- `afterAll` -> not needed (process cleanup handled by `--test-force-exit`)
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
NODE_ENV=test node --import tsx --test --test-force-exit test/api-supertest/<name>.test.ts
```

If tests fail, read the error output and fix. Common issues:
- Timeout: increase `before` timeout or individual test timeout
- Auth failures: verify login credentials match seeded data
- Wrong status codes: in-memory DB may behave slightly differently

## Step 7: Delete the old Frisby file

After the new supertest test passes, delete the original Frisby test file from `test/api/`.

## Important constraints

- Do NOT modify `server.ts`, `models/index.ts`, `package.json`, or helper files
- Do NOT create new helper files
- Keep test descriptions identical to originals
- Preserve full test coverage - don't skip tests
- Each test file gets its own `createTestApp()` lifecycle (no manual cleanup needed)
