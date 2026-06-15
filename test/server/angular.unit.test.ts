/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { serveAngularClient } from '../../routes/angular'

void describe('angular', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { }
    res = { sendFile: mock.fn() }
    next = mock.fn()
  })

  void it('should serve index.html for any URL', () => {
    req.url = '/any/thing'

    serveAngularClient()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 1)
    assert.match(res.sendFile.mock.calls[0].arguments[0], /index\.html/)
  })

  void it('should raise error for /api endpoint URL', () => {
    req.url = '/api'

    serveAngularClient()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 0)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })

  void it('should raise error for /rest endpoint URL', () => {
    req.url = '/rest'

    serveAngularClient()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 0)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })
})
