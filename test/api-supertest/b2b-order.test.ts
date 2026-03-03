/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import type { Sequelize } from 'sequelize'
import { challenges } from '../../data/datacache'
import * as utils from '../../lib/utils'
import * as security from '../../lib/insecurity'
import { createTestApp } from './helpers/setup'

let app: Express
let db: Sequelize
const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
  db = result.sequelize
}, { timeout: 60000 })

after(async () => {
  await db?.close()
})

void describe('/b2b/v2/orders', () => {
  if (utils.isChallengeEnabled(challenges.rceChallenge) || utils.isChallengeEnabled(challenges.rceOccupyChallenge)) {
    void it('POST endless loop exploit in "orderLinesData" will raise explicit error', async () => {
      const res = await request(app)
        .post('/b2b/v2/orders')
        .set(authHeader)
        .send({
          orderLinesData: '(function dos() { while(true); })()'
        })

      assert.equal(res.status, 500)
      assert.ok(res.text.includes('Infinite loop detected - reached max iterations'))
    })

    void it('POST busy spinning regex attack does not raise an error', async () => {
      const res = await request(app)
        .post('/b2b/v2/orders')
        .set(authHeader)
        .send({
          orderLinesData: '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'
        })

      assert.equal(res.status, 503)
    })

    void it('POST sandbox breakout attack in "orderLinesData" will raise error', async () => {
      const res = await request(app)
        .post('/b2b/v2/orders')
        .set(authHeader)
        .send({
          orderLinesData: 'this.constructor.constructor("return process")().exit()'
        })

      assert.equal(res.status, 500)
    })
  }

  void it('POST new B2B order is forbidden without authorization token', async () => {
    const res = await request(app)
      .post('/b2b/v2/orders')
      .send({})

    assert.equal(res.status, 401)
  })

  void it('POST new B2B order accepts arbitrary valid JSON', async () => {
    const res = await request(app)
      .post('/b2b/v2/orders')
      .set(authHeader)
      .send({
        foo: 'bar',
        test: 42
      })

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    if (res.body.cid !== undefined) assert.equal(typeof res.body.cid, 'string')
    assert.equal(typeof res.body.orderNo, 'string')
    assert.equal(typeof res.body.paymentDue, 'string')
  })

  void it('POST new B2B order has passed "cid" in response', async () => {
    const res = await request(app)
      .post('/b2b/v2/orders')
      .set(authHeader)
      .send({
        cid: 'test'
      })

    assert.equal(res.status, 200)
    assert.equal(res.body.cid, 'test')
  })
})
