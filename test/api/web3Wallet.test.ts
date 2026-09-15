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

const skipReason = process.env.ALCHEMY_API_KEY ? undefined : 'ALCHEMY_API_KEY not set'

void describe('/rest/web3/walletExploitAddress', { skip: skipReason }, () => {
  before(async () => {
    const result = await createTestApp()
    app = result.app
  }, { timeout: 60000 })

  void it('POST missing wallet address in request body still leads to success notification', async () => {
    const res = await request(app)
      .post('/rest/web3/walletExploitAddress')
      .send({})

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.success, true)
    assert.equal(res.body.message, 'Event Listener Created')
  })

  void it('POST invalid wallet address in request body still leads to success notification', async () => {
    const res = await request(app)
      .post('/rest/web3/walletExploitAddress')
      .send({ walletAddress: 'lalalalala' })

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.success, true)
    assert.equal(res.body.message, 'Event Listener Created')
  })

  void it('POST self-referential address in request body leads to success notification', async () => {
    const res = await request(app)
      .post('/rest/web3/walletExploitAddress')
      .send({ walletAddress: '0x413744D59d31AFDC2889aeE602636177805Bd7b0' })

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.success, true)
    assert.equal(res.body.message, 'Event Listener Created')
  })
})
