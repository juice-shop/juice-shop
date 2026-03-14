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
import { challenges } from '../../data/datacache'
import * as security from '../../lib/insecurity'
import * as utils from '../../lib/utils'

let app: Express
let authHeader: Record<string, string>

before(async () => {
  const result = await createTestApp()
  app = result.app
  authHeader = { Authorization: `Bearer ${security.authorize()}`, 'content-type': 'application/json' }
}, { timeout: 60000 })

const jsonHeader = { 'content-type': 'application/json' }

void describe('/api/Users', () => {
  void it('GET all users is forbidden via public API', async () => {
    const res = await request(app).get('/api/Users')
    assert.equal(res.status, 401)
  })

  void it('GET all users', async () => {
    const res = await request(app).get('/api/Users').set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('GET all users doesnt include passwords', async () => {
    const res = await request(app).get('/api/Users').set(authHeader)
    assert.equal(res.status, 200)
    for (const user of res.body.data) {
      assert.equal(user.password, undefined)
    }
  })

  void it('POST new user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst@horstma.nn',
        password: 'hooooorst'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST new admin', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst2@horstma.nn',
        password: 'hooooorst',
        role: 'admin'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'admin')
  })

  void it('POST new blank user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: ' ',
        password: ' '
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST same blank user in database', async () => {
    await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'blank-duplicate@test.test',
        password: ' '
      })
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'blank-duplicate@test.test',
        password: ' '
      })
    assert.equal(res.status, 400)
    assert.ok(res.headers['content-type']?.includes('application/json'))
  })

  void it('POST whitespaces user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: ' test@gmail.com',
        password: ' test'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
  })

  void it('POST new deluxe user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst3@horstma.nn',
        password: 'hooooorst',
        role: 'deluxe'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'deluxe')
  })

  void it('POST new accounting user', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst4@horstma.nn',
        password: 'hooooorst',
        role: 'accounting'
      })
    assert.equal(res.status, 201)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.data.id, 'number')
    assert.equal(typeof res.body.data.createdAt, 'string')
    assert.equal(typeof res.body.data.updatedAt, 'string')
    assert.equal(res.body.data.password, undefined)
    assert.equal(res.body.data.role, 'accounting')
  })

  void it('POST user not belonging to customer, deluxe, accounting, admin is forbidden', async () => {
    const res = await request(app)
      .post('/api/Users')
      .set(jsonHeader)
      .send({
        email: 'horst5@horstma.nn',
        password: 'hooooorst',
        role: 'accountinguser'
      })
    assert.equal(res.status, 400)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.message, 'Validation error: Validation isIn on role failed')
    assert.equal(res.body.errors[0].field, 'role')
    assert.equal(res.body.errors[0].message, 'Validation isIn on role failed')
  })

  if (utils.isChallengeEnabled(challenges.persistedXssUserChallenge)) {
    void it('POST new user with XSS attack in email address', async () => {
      const res = await request(app)
        .post('/api/Users')
        .set(jsonHeader)
        .send({
          email: '<iframe src="javascript:alert(`xss`)">',
          password: 'does.not.matter'
        })
      assert.equal(res.status, 201)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.email, '<iframe src="javascript:alert(`xss`)">')
    })
  }
})

void describe('/api/Users/:id', () => {
  void it('GET existing user by id is forbidden via public API', async () => {
    const res = await request(app).get('/api/Users/1')
    assert.equal(res.status, 401)
  })

  void it('PUT update existing user is forbidden via public API', async () => {
    const res = await request(app)
      .put('/api/Users/1')
      .set(jsonHeader)
      .send({ email: 'administr@t.or' })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing user is forbidden via public API', async () => {
    const res = await request(app).delete('/api/Users/1')
    assert.equal(res.status, 401)
  })

  void it('GET existing user by id', async () => {
    const res = await request(app).get('/api/Users/1').set(authHeader)
    assert.equal(res.status, 200)
  })

  void it('PUT update existing user is forbidden via API even when authenticated', async () => {
    const res = await request(app)
      .put('/api/Users/1')
      .set(authHeader)
      .send({ email: 'horst.horstmann@horstma.nn' })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing user is forbidden via API even when authenticated', async () => {
    const res = await request(app).delete('/api/Users/1').set(authHeader)
    assert.equal(res.status, 401)
  })
})

void describe('/rest/user/whoami', () => {
  void it('GET own user id and email on who-am-i request', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(res.body.user.email, 'bjoern.kimminich@gmail.com')
  })

  void it('GET who-am-i request returns nothing on missing auth token', async () => {
    const res = await request(app).get('/rest/user/whoami')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on invalid auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'Bearer InvalidAuthToken' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on broken auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'BoarBeatsBear' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i request returns nothing on expired auth token', async () => {
    const res = await request(app)
      .get('/rest/user/whoami')
      .set({ Authorization: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MSwidXNlcm5hbWUiOiIiLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwicGFzc3dvcmQiOiIwMTkyMDIzYTdiYmQ3MzI1MDUxNmYwNjlkZjE4YjUwMCIsInJvbGUiOiJhZG1pbiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6ImRlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJ1cGRhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE1NjYyMzAyMjQsImV4cCI6MTU2NjI0ODIyNH0.FL0kkcInY5sDMGKeLHfEOYDTQd3BjR6_mK7Tcm_RH6iCLotTSRRoRxHpLkbtIQKqBFIt14J4BpLapkzG7ppRWcEley5nego-4iFOmXQvCBz5ISS3HdtM0saJnOe0agyVUen3huFp4F2UCth_y2ScjMn_4AgW66cz8NSFPRVpC8g' })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.deepEqual(res.body.user, {})
  })

  void it('GET who-am-i with fields parameter returns only requested fields', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(res.body.user.email, 'bjoern.kimminich@gmail.com')
  })

  void it('GET who-am-i with fields parameter does not return password by default', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
  })

  void it('GET who-am-i with fields parameter can be tricked into returning password', async () => {
    const { token } = await login(app, {
      email: 'bjoern.kimminich@gmail.com',
      password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
    const res = await request(app)
      .get('/rest/user/whoami?fields=id,email,password')
      .set({ Cookie: `token=${token}` })
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.user.id, 'number')
    assert.equal(typeof res.body.user.email, 'string')
    assert.equal(typeof res.body.user.password, 'string')
  })
})
