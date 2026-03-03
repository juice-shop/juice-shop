/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import type { Sequelize } from 'sequelize'
import { createTestApp } from './helpers/setup'
import * as utils from '../../lib/utils'

let app: Express
let db: Sequelize

before(async () => {
  const result = await createTestApp()
  app = result.app
  db = result.sequelize
}, { timeout: 60000 })

after(async () => {
  await db?.close()
})

void describe('/rest/admin/application-version', () => {
  void it('GET application version from package.json', async () => {
    const res = await request(app)
      .get('/rest/admin/application-version')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.version, utils.version())
  })
})

void describe('/rest/admin/application-configuration', () => {
  void it('GET application configuration', async () => {
    const res = await request(app)
      .get('/rest/admin/application-configuration')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(typeof res.body.config, 'object')
    assert.ok(res.body.config !== null)
  })
})
