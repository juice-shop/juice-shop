/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import * as security from '../../lib/insecurity'
import config from 'config'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'

let app: Express
const authHeader = { Authorization: `Bearer ${security.authorize({ data: { email: 'admin@juice-sh.op' } })}`, 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/user/authentication-details', () => {
  void it('GET all users with password replaced by asterisks', async () => {
    const res = await request(app)
      .get('/rest/user/authentication-details')
      .set(authHeader)

    assert.equal(res.status, 200)
    const userWithAsterisks = res.body.data.find((user: any) => user.password === '********************************')
    assert.ok(userWithAsterisks, 'Expected at least one user with password replaced by asterisks')
  })

  void it('GET returns lastLoginTime for users with active sessions', async () => {
    await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .get('/rest/user/authentication-details')
      .set(authHeader)

    assert.equal(res.status, 200)

    const jim = res.body.data.find((user: any) => user.email.startsWith('jim@'))
    assert.ok(jim, 'Expected to find jim in the user list')
    assert.equal(typeof jim.lastLoginTime, 'number')
  })
})
