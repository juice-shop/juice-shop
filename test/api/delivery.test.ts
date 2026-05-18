/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api/Deliverys', () => {
  void describe('for regular customer', () => {
    let authHeader: { Authorization: string, 'content-type': string }

    before(async () => {
      const { token } = await login(app, {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      })
      authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
    })

    void it('GET delivery methods', async () => {
      const res = await request(app)
        .get('/api/Deliverys')
        .set(authHeader)

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.length, 3)
      assert.equal(res.body.data[0].id, 1)
      assert.equal(res.body.data[0].name, 'One Day Delivery')
      assert.equal(res.body.data[0].price, 0.99)
      assert.equal(res.body.data[0].eta, 1)
    })
  })

  void describe('for deluxe customer', () => {
    let authHeader: { Authorization: string, 'content-type': string }

    before(async () => {
      const { token } = await login(app, {
        email: 'ciso@' + config.get<string>('application.domain'),
        password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
      })
      authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
    })

    void it('GET delivery methods', async () => {
      const res = await request(app)
        .get('/api/Deliverys')
        .set(authHeader)

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.length, 3)
      assert.equal(res.body.data[0].id, 1)
      assert.equal(res.body.data[0].name, 'One Day Delivery')
      assert.equal(res.body.data[0].price, 0.5)
      assert.equal(res.body.data[0].eta, 1)
    })
  })
})

void describe('/api/Deliverys/:id', () => {
  void describe('for regular customer', () => {
    let authHeader: { Authorization: string, 'content-type': string }

    before(async () => {
      const { token } = await login(app, {
        email: 'jim@' + config.get<string>('application.domain'),
        password: 'ncc-1701'
      })
      authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
    })

    void it('GET delivery method', async () => {
      const res = await request(app)
        .get('/api/Deliverys/2')
        .set(authHeader)

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.id, 2)
      assert.equal(res.body.data.name, 'Fast Delivery')
      assert.equal(res.body.data.price, 0.5)
      assert.equal(res.body.data.eta, 3)
    })

    void it('GET non-existing delivery method returns 400', async () => {
      const res = await request(app)
        .get('/api/Deliverys/999999')
        .set(authHeader)

      assert.equal(res.status, 400)
    })
  })

  void describe('for deluxe customer', () => {
    let authHeader: { Authorization: string, 'content-type': string }

    before(async () => {
      const { token } = await login(app, {
        email: 'ciso@' + config.get<string>('application.domain'),
        password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
      })
      authHeader = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }
    })

    void it('GET delivery method', async () => {
      const res = await request(app)
        .get('/api/Deliverys/2')
        .set(authHeader)

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('application/json'))
      assert.equal(res.body.data.id, 2)
      assert.equal(res.body.data.name, 'Fast Delivery')
      assert.equal(res.body.data.price, 0)
      assert.equal(res.body.data.eta, 3)
    })
  })
})
