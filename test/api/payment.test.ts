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
let cardId: number

before(async () => {
  const result = await createTestApp()
  app = result.app
  const { token } = await login(app, { email: 'jim@juice-sh.op', password: 'ncc-1701' })
  authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
}, { timeout: 60000 })

void describe('/api/Cards', () => {
  void it('GET all cards is forbidden via public API', async () => {
    const res = await request(app).get('/api/Cards')
    assert.equal(res.status, 401)
  })

  void it('GET all cards', async () => {
    const res = await request(app).get('/api/Cards').set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('POST new card is forbidden via public API', async () => {
    const res = await request(app).post('/api/Cards').send({
      fullName: 'Jim',
      cardNum: 12345678876543210,
      expMonth: 1,
      expYear: new Date().getFullYear()
    })
    assert.equal(res.status, 401)
  })

  void it('POST new card with all valid fields', async () => {
    const res = await request(app).post('/api/Cards').set(authHeader).send({
      fullName: 'Jim',
      cardNum: 1234567887654321,
      expMonth: 1,
      expYear: 2085
    })
    assert.equal(res.status, 201)
  })

  void it('GET all cards returns masked card numbers', async () => {
    const res = await request(app).get('/api/Cards').set(authHeader)
    assert.equal(res.status, 200)
    assert.ok(JSON.stringify(res.body).includes('"cardNum":"************4321"'))
  })

  void it('POST new card with invalid card number', async () => {
    const res = await request(app).post('/api/Cards').set(authHeader).send({
      fullName: 'Jim',
      cardNum: 12345678876543210,
      expMonth: 1,
      expYear: new Date().getFullYear()
    })
    assert.equal(res.status, 400)
  })

  void it('POST new card with invalid expMonth', async () => {
    const res = await request(app).post('/api/Cards').set(authHeader).send({
      fullName: 'Jim',
      cardNum: 1234567887654321,
      expMonth: 13,
      expYear: new Date().getFullYear()
    })
    assert.equal(res.status, 400)
  })

  void it('POST new card with invalid expYear', async () => {
    const res = await request(app).post('/api/Cards').set(authHeader).send({
      fullName: 'Jim',
      cardNum: 1234567887654321,
      expMonth: 1,
      expYear: 2015
    })
    assert.equal(res.status, 400)
  })
})

void describe('/api/Cards/:id', () => {
  before(async () => {
    const res = await request(app).post('/api/Cards').set(authHeader).send({
      fullName: 'Jim',
      cardNum: 1234567887654321,
      expMonth: 1,
      expYear: 2088
    })
    assert.equal(res.status, 201)
    cardId = res.body.data.id
  })

  void it('GET card by id is forbidden via public API', async () => {
    const res = await request(app).get('/api/Cards/' + cardId)
    assert.equal(res.status, 401)
  })

  void it('PUT update card is forbidden via public API', async () => {
    const res = await request(app).put('/api/Cards/' + cardId).send({ quantity: 2 })
    assert.equal(res.status, 401)
  })

  void it('DELETE card by id is forbidden via public API', async () => {
    const res = await request(app).delete('/api/Cards/' + cardId)
    assert.equal(res.status, 401)
  })

  void it('GET card by id', async () => {
    const res = await request(app).get('/api/Cards/' + cardId).set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('GET card by id returns masked card number', async () => {
    const res = await request(app).get('/api/Cards/' + cardId).set(authHeader)
    assert.equal(res.status, 200)
    assert.ok(JSON.stringify(res.body).includes('"cardNum":"************4321"'))
  })

  void it('GET card by non-existing id returns 400 for authorized user', async () => {
    const nonExistingId = 999999
    const res = await request(app).get('/api/Cards/' + nonExistingId).set(authHeader)
    assert.equal(res.status, 400)
    assert.equal(res.body.status, 'error')
    assert.equal(res.body.data, 'Malicious activity detected')
  })

  void it('PUT update card by id is forbidden via authorized API call', async () => {
    const res = await request(app).put('/api/Cards/' + cardId).set(authHeader).send({ fullName: 'Jimy' })
    assert.equal(res.status, 401)
  })

  void it('DELETE card by id', async () => {
    const res = await request(app).delete('/api/Cards/' + cardId).set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('DELETE card by id again returns 400 for authorized user', async () => {
    const res = await request(app).delete('/api/Cards/' + cardId).set(authHeader)
    assert.equal(res.status, 400)
    assert.equal(res.body.status, 'error')
    assert.equal(res.body.data, 'Malicious activity detected.')
  })
})
