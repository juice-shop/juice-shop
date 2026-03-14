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

void describe('/rest/repeat-notification', () => {
  void it('GET triggers repeating notification without passing a challenge', async () => {
    const res = await request(app)
      .get('/rest/repeat-notification')

    assert.equal(res.status, 200)
  })

  void it('GET triggers repeating notification passing an unsolved challenge', async () => {
    const res = await request(app)
      .get('/rest/repeat-notification?challenge=Retrieve%20Blueprint')

    assert.equal(res.status, 200)
  })

  void it('GET triggers repeating notification passing a solved challenge', async () => {
    const res = await request(app)
      .get('/rest/repeat-notification?challenge=Error%20Handling')

    assert.equal(res.status, 200)
  })
})
