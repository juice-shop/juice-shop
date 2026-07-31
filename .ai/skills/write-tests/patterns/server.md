# Pattern: Server unit tests (`test/server/*.unit.test.ts`)

Server unit tests use the **Node.js built-in test runner** (`node:test`) and **`node:assert/strict`** — no Jest/Mocha, no `expect`. They run via `npm run test:server`. Use them for logic in `lib/`, `models/`, and route handlers that can be driven with fake `req`/`res`/`next`.

## Skeleton

```typescript
/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { functionUnderTest } from '../../lib/moduleUnderTest'

void describe('moduleUnderTest', () => {
  void it('does the expected thing', () => {
    assert.equal(functionUnderTest('input'), 'expected')
  })
})
```

## Conventions & rules

- Prefix every top-level `describe`/`it` with `void` (the runner returns promises; `void` satisfies the linter). See any file in `test/server/`.
- Keep the license header at the top of every new file.
- File name mirrors the module under test and ends with `.unit.test.ts` (e.g. `keyServer.unit.test.ts` for `routes/keyServer.ts`).
- Assertions: `assert.equal`, `assert.deepEqual`, `assert.match`, `assert.ok`, `assert.rejects`, `await assert.rejects(...)` for async.

## Mocking

Use `mock.fn()` from `node:test` for spies/stubs. Reset shared state in `beforeEach`.

```typescript
let req: any, res: any, next: any
beforeEach(() => {
  req = { params: {} }
  res = { sendFile: mock.fn(), status: mock.fn() }
  next = mock.fn()
})

void it('serves the file', () => {
  req.params.file = 'test.file'
  serveKeyFiles()(req, res, next)
  assert.equal(res.sendFile.mock.calls.length, 1)
  assert.match(res.sendFile.mock.calls[0].arguments[0], /encryptionkeys[/\\]test.file/)
})
```

- Read spy calls via `spy.mock.calls.length` and `spy.mock.calls[i].arguments[j]`.
- When a module is imported with `require`, you can override methods on it for the duration of a test and restore them in a `finally` block (see `challengeUtils.unit.test.ts`, which stubs `HintModel.count`, `ChallengeModel.update`, and `global.io`).

## Study these real examples

- **Route handler with mock req/res/next** → `test/server/keyServer.unit.test.ts` (small, ideal starting template).
- **`lib/` logic with `mock.fn`, `beforeEach` reset, async, negative cases** → `test/server/challengeUtils.unit.test.ts`.
- **Pure utility functions** → `test/server/utils.unit.test.ts`, `test/server/insecurity.unit.test.ts`.

Always open the closest existing example and mirror its structure before writing new tests.
