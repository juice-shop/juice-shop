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

void describe('/rest/tags', () => {
  void it('GET all tag groups', async () => {
    const res = await request(app)
      .get('/rest/tags')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body, 'object')
    const groupNames = Object.keys(res.body)
    assert.ok(groupNames.length > 0)
    for (const groupName of groupNames) {
      assert.equal(typeof groupName, 'string')
      assert.ok(Array.isArray(res.body[groupName]))
      for (const tag of res.body[groupName]) {
        assert.equal(typeof tag, 'string')
      }
    }
  })
})
