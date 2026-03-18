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

void describe('/rest/track-order/:id', () => {
  void it('GET tracking results for the order id', async () => {
    const res = await request(app)
      .get('/rest/track-order/5267-f9cd5882f54c75a3')
    assert.equal(res.status, 200)
  })

  void it('GET all orders by injecting into orderId', async () => {
    const res = await request(app)
      .get('/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.ok(Array.isArray(res.body.data))
    for (const item of res.body.data) {
      assert.equal(typeof item.orderId, 'string')
      assert.equal(typeof item.email, 'string')
      assert.equal(typeof item.totalPrice, 'number')
      assert.ok(Array.isArray(item.products))
      for (const product of item.products) {
        assert.equal(typeof product.quantity, 'number')
        assert.equal(typeof product.name, 'string')
        assert.equal(typeof product.price, 'number')
        assert.equal(typeof product.total, 'number')
      }
      assert.equal(typeof item.eta, 'string')
      assert.equal(typeof item._id, 'string')
    }
  })
})
