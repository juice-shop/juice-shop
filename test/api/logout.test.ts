/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import { login, register } from './helpers/auth'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/user/logout', () => {
  void it('POST revokes the active token', async () => {
    await register(app, { email: 'logout-replay@test.invalid', password: 'password123' })
    const { token, bid } = await login(app, {
      email: 'logout-replay@test.invalid',
      password: 'password123'
    })
    const authHeader = { Authorization: 'Bearer ' + token }

    const authenticated = await request(app).get('/rest/basket/' + bid).set(authHeader)
    assert.equal(authenticated.status, 200)

    const logout = await request(app).post('/rest/user/logout').set(authHeader)
    assert.equal(logout.status, 200)
    assert.match(logout.headers['set-cookie'][0], /^token=;/)

    const replay = await request(app).get('/rest/basket/' + bid).set(authHeader)
    assert.equal(replay.status, 401)
  })

  void it('uses a fresh bearer token when a revoked token remains in a cookie', async () => {
    await register(app, { email: 'logout-stale@test.invalid', password: 'password123' })
    const firstSession = await login(app, {
      email: 'logout-stale@test.invalid',
      password: 'password123'
    })
    await request(app)
      .post('/rest/user/logout')
      .set({ Authorization: 'Bearer ' + firstSession.token })
      .expect(200)

    await register(app, { email: 'logout-current@test.invalid', password: 'password123' })
    const secondSession = await login(app, {
      email: 'logout-current@test.invalid',
      password: 'password123'
    })
    const res = await request(app)
      .get('/rest/basket/' + secondSession.bid)
      .set({ Authorization: 'Bearer ' + secondSession.token })
      .set({ Cookie: 'token=' + firstSession.token })

    assert.equal(res.status, 200)

    const logout = await request(app)
      .post('/rest/user/logout')
      .set({ Authorization: 'Bearer ' + secondSession.token })
      .set({ Cookie: 'token=' + firstSession.token })
    assert.equal(logout.status, 200)

    const replay = await request(app)
      .get('/rest/basket/' + secondSession.bid)
      .set({ Authorization: 'Bearer ' + secondSession.token })
    assert.equal(replay.status, 401)
  })
})
