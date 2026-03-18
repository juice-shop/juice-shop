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

let app: Express
let authHeader: { Authorization: string, 'content-type': string }

before(async () => {
  const result = await createTestApp()
  app = result.app
  const { token } = await login(app, { email: 'demo', password: 'demo' })
  authHeader = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' }
}, { timeout: 60000 })

void describe('/api/Wallets', () => {
  void it('GET wallet is forbidden via public API', async () => {
    const res = await request(app)
      .get('/rest/wallet/balance')
    assert.equal(res.status, 401)
  })

  void it('GET wallet retrieves wallet amount of requesting user', async () => {
    const res = await request(app)
      .get('/rest/wallet/balance')
      .set(authHeader)
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data, 200)
  })

  void it('PUT wallet is forbidden via public API', async () => {
    const res = await request(app)
      .put('/rest/wallet/balance')
      .send({ balance: 10 })
    assert.equal(res.status, 401)
  })

  void it('PUT charge wallet from credit card of requesting user', async () => {
    const res = await request(app)
      .put('/rest/wallet/balance')
      .set(authHeader)
      .send({ balance: 10, paymentId: 2 })
    assert.equal(res.status, 200)

    const balanceRes = await request(app)
      .get('/rest/wallet/balance')
      .set(authHeader)
    assert.equal(balanceRes.status, 200)
    assert.ok(balanceRes.headers['content-type']?.includes('application/json'))
    assert.equal(balanceRes.body.data, 210)
  })

  void it('PUT charge wallet from foreign credit card is forbidden', async () => {
    const res = await request(app)
      .put('/rest/wallet/balance')
      .set(authHeader)
      .send({ balance: 10, paymentId: 1 })
    assert.equal(res.status, 402)
  })

  void it('PUT charge wallet without credit card is forbidden', async () => {
    const res = await request(app)
      .put('/rest/wallet/balance')
      .set(authHeader)
      .send({ balance: 10 })
    assert.equal(res.status, 402)
  })
})
