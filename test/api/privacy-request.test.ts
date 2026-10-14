/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import * as security from '../../lib/insecurity'

let app: Express
const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api/PrivacyRequests', () => {
  void it('POST new complaint', async () => {
    const res = await request(app)
      .post('/api/PrivacyRequests')
      .set(authHeader)
      .send({
        UserId: 1,
        deletionRequested: false
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
  })

  void it('GET all privacy requests is forbidden via public API', async () => {
    const res = await request(app)
      .get('/api/PrivacyRequests')
    assert.equal(res.status, 401)
  })
})

void describe('/api/PrivacyRequests/:id', () => {
  void it('GET all privacy requests is forbidden', async () => {
    const res = await request(app)
      .get('/api/PrivacyRequests')
      .set(authHeader)
    assert.equal(res.status, 401)
  })

  void it('GET existing privacy request by id is forbidden', async () => {
    const res = await request(app)
      .get('/api/PrivacyRequests/1')
      .set(authHeader)
    assert.equal(res.status, 401)
  })

  void it('PUT update existing privacy request is forbidden', async () => {
    const res = await request(app)
      .put('/api/PrivacyRequests/1')
      .set(authHeader)
      .send({
        message: 'Should not work...'
      })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing privacy request is forbidden', async () => {
    const res = await request(app)
      .delete('/api/PrivacyRequests/1')
      .set(authHeader)
    assert.equal(res.status, 401)
  })
})
