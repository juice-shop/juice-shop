/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import type { Sequelize } from 'sequelize'
import config from 'config'
import { createTestApp } from './helpers/setup'

let app: Express
let db: Sequelize

before(async () => {
  const result = await createTestApp()
  app = result.app
  db = result.sequelize
}, { timeout: 60000 })

after(async () => {
  // error page is rendering weirdly and crashing when the db connection is immediatly closed.
  await new Promise(resolve => setTimeout(resolve, 100))
  await db?.close()
})

void describe('/api', () => {
  void it('GET error when query /api without actual resource', async () => {
    const res = await request(app)
      .get('/api')
    assert.equal(res.status, 500)
  })
})

void describe('/rest', () => {
  void it('GET error message with information leakage when calling unrecognized path with /rest in it', async () => {
    const res = await request(app)
      .get('/rest/unrecognized')
    assert.equal(res.status, 500)
    assert.ok(res.text.includes('<h1>' + config.get<string>('application.name') + ' (Express'))
    assert.ok(res.text.includes('Unexpected path: /rest/unrecognized'))
  })
})
