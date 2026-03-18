/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import * as security from '../../lib/insecurity'
import { createTestApp } from './helpers/setup'

let app: Express
const authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api/SecurityQuestions', () => {
  void it('GET all security questions ', async () => {
    const res = await request(app)
      .get('/api/SecurityQuestions')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.ok(Array.isArray(res.body.data))
    for (const item of res.body.data) {
      assert.equal(typeof item.id, 'number')
      assert.equal(typeof item.question, 'string')
    }
  })

  void it('POST new security question is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .post('/api/SecurityQuestions')
      .set(authHeader)
      .send({ question: 'Your own first name?' })

    assert.equal(res.status, 401)
  })
})

void describe('/api/SecurityQuestions/:id', () => {
  void it('GET existing security question by id is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .get('/api/SecurityQuestions/1')
      .set(authHeader)

    assert.equal(res.status, 401)
  })

  void it('PUT update existing security question is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .put('/api/SecurityQuestions/1')
      .set(authHeader)
      .send({ question: 'Your own first name?' })

    assert.equal(res.status, 401)
  })

  void it('DELETE existing security question is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .delete('/api/SecurityQuestions/1')
      .set(authHeader)

    assert.equal(res.status, 401)
  })
})

void describe('/rest/user/security-question', () => {
  void it('GET security question for an existing user\'s email address', async () => {
    const res = await request(app)
      .get(`/rest/user/security-question?email=jim@${config.get<string>('application.domain')}`)

    assert.equal(res.status, 200)
    assert.equal(res.body.question.question, 'Your eldest siblings middle name?')
  })

  void it('GET security question returns nothing for an unknown email address', async () => {
    const res = await request(app)
      .get('/rest/user/security-question?email=horst@unknown-us.er')

    assert.equal(res.status, 200)
    assert.deepEqual(res.body, {})
  })

  void it('GET security question throws error for missing email address', async () => {
    const res = await request(app)
      .get('/rest/user/security-question')

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('Error: WHERE parameter &quot;email&quot; has invalid &quot;undefined&quot; value'))
  })

  void it('GET security question is not susceptible to SQL Injection attacks', async () => {
    const res = await request(app)
      .get("/rest/user/security-question?email=';")

    assert.equal(res.status, 200)
  })
})
