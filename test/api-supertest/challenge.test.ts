/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'
import * as security from '../../lib/insecurity'
import { ChallengeDependencyModelInit } from '../../models/challengeDependency'

let app: Express
const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }

before(async () => {
  const result = await createTestApp()
  app = result.app
  ChallengeDependencyModelInit(result.sequelize)
  await result.sequelize.sync()
}, { timeout: 60000 })

void describe('/api/Challenges', () => {
  void it('GET all challenges', async () => {
    const res = await request(app)
      .get('/api/Challenges')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.ok(Array.isArray(res.body.data))
    for (const item of res.body.data) {
      assert.equal(typeof item.id, 'number')
      assert.equal(typeof item.key, 'string')
      assert.equal(typeof item.name, 'string')
      assert.equal(typeof item.description, 'string')
      assert.equal(typeof item.difficulty, 'number')
      assert.equal(typeof item.solved, 'boolean')
    }
  })

  void it('POST new challenge is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .post('/api/Challenges')
      .set(authHeader)
      .send({
        name: 'Invulnerability',
        description: 'I am not a vulnerability!',
        difficulty: 3,
        solved: false
      })
    assert.equal(res.status, 401)
  })
})

void describe('/api/Challenges/:id', () => {
  void it('GET existing challenge by id is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .get('/api/Challenges/1')
      .set(authHeader)
    assert.equal(res.status, 401)
  })

  void it('PUT update existing challenge is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .put('/api/Challenges/1')
      .set(authHeader)
      .send({
        name: 'Vulnerability',
        description: 'I am a vulnerability!!!',
        difficulty: 3
      })
    assert.equal(res.status, 401)
  })

  void it('DELETE existing challenge is forbidden via public API even when authenticated', async () => {
    const res = await request(app)
      .delete('/api/Challenges/1')
      .set(authHeader)
    assert.equal(res.status, 401)
  })
})

void describe('/rest/continue-code', () => {
  void it('GET can retrieve continue code for currently solved challenges', async () => {
    const res = await request(app)
      .get('/rest/continue-code')
    assert.equal(res.status, 200)
  })

  void it('PUT invalid continue code is rejected (alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code/apply/ThisIsDefinitelyNotAValidContinueCode')
    assert.equal(res.status, 404)
  })

  void it('PUT invalid continue code is rejected (non-alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code/apply/%3Cimg%20src=nonexist1%20onerror=alert()%3E')
    assert.equal(res.status, 404)
  })

  void it('PUT continue code for more than one challenge is accepted', async () => {
    const res = await request(app)
      .put('/rest/continue-code/apply/yXjv6Z5jWJnzD6a3YvmwPRXK7roAyzHDde2Og19yEN84plqxkMBbLVQrDeoY')
    assert.equal(res.status, 200)
  })

  void it('PUT continue code for non-existent challenge #999 is accepted', async () => {
    const res = await request(app)
      .put('/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkM6Ae9M7k2rK63YpqQLPjnlb5V5LvDj')
    assert.equal(res.status, 200)
  })
})

void describe('/rest/continue-code-findIt', () => {
  void it('GET can retrieve continue code for currently solved challenges', async () => {
    const res = await request(app)
      .get('/rest/continue-code-findIt')
    assert.equal(res.status, 200)
  })

  void it('PUT invalid continue code is rejected (alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code-findIt/apply/ThisIsDefinitelyNotAValidContinueCode')
    assert.equal(res.status, 404)
  })

  void it('PUT completely invalid continue code is rejected (non-alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code-findIt/apply/%3Cimg%20src=nonexist1%20onerror=alert()%3E')
    assert.equal(res.status, 404)
  })

  void it('PUT continue code for more than one challenge is accepted', async () => {
    const res = await request(app)
      .put('/rest/continue-code-findIt/apply/Xg9oK0VdbW5g1KX9G7JYnqLpz3rAPBh6p4eRlkDM6EaBON2QoPmxjyvwMrP6')
    assert.equal(res.status, 200)
  })
})

void describe('/rest/continue-code-fixIt', () => {
  void it('GET can retrieve continue code for currently solved challenges', async () => {
    const res = await request(app)
      .get('/rest/continue-code-fixIt')
    assert.equal(res.status, 200)
  })

  void it('PUT invalid continue code is rejected (alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code-fixIt/apply/ThisIsDefinitelyNotAValidContinueCode')
    assert.equal(res.status, 404)
  })

  void it('PUT completely invalid continue code is rejected (non-alphanumeric)', async () => {
    const res = await request(app)
      .put('/rest/continue-code-fixIt/apply/%3Cimg%20src=nonexist1%20onerror=alert()%3E')
    assert.equal(res.status, 404)
  })

  void it('PUT continue code for more than one challenge is accepted', async () => {
    const res = await request(app)
      .put('/rest/continue-code-fixIt/apply/y28BEPE2k3yRrdz5p6DGqJONnj41n5UEWawYWgBMoVmL79bKZ8Qve0Xl5QLW')
    assert.equal(res.status, 200)
  })
})
