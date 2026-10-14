/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/languages', () => {
  void it('GET all languages', async () => {
    const res = await request(app)
      .get('/rest/languages')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.ok(Array.isArray(res.body))
    assert.ok(res.body.length > 0)
    for (const lang of res.body) {
      assert.equal(typeof lang.key, 'string')
      assert.equal(typeof lang.lang, 'string')
      if (lang.icons !== undefined) assert.ok(Array.isArray(lang.icons))
      assert.equal(typeof lang.percentage, 'number')
      if (lang.shortKey !== undefined) assert.equal(typeof lang.shortKey, 'string')
      assert.equal(typeof lang.gauge, 'string')
    }
  })
})
