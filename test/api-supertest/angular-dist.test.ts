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

void describe('/api', () => {
  void it('GET main.js contains Cryptocurrency URLs', async () => {
    const res = await request(app)
      .get('/main.js')

    assert.equal(res.status, 200)
    assert.ok(res.text.includes('/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm'))
    assert.ok(res.text.includes('/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'))
    assert.ok(res.text.includes('/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'))
  })

  void it('GET main.js contains password hint for support team', async () => {
    const res = await request(app)
      .get('/main.js')

    assert.equal(res.status, 200)
    assert.ok(res.text.includes('Parola echipei de asisten\\u021B\\u0103 nu respect\\u0103 politica corporativ\\u0103 pentru conturile privilegiate! V\\u0103 rug\\u0103m s\\u0103 schimba\\u021Bi parola \\xEEn consecin\\u021B\\u0103!'))
  })
})
