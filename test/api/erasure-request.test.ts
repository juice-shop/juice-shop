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
import * as utils from '../../lib/utils'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/dataerasure', () => {
  void it('GET erasure form for logged-in users includes their email and security question', async () => {
    const { token } = await login(app, { email: 'bjoern@owasp.org', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

    const res = await request(app)
      .get('/dataerasure/')
      .set({ Cookie: 'token=' + token })

    assert.equal(res.status, 200)
    assert.ok(res.text.includes('bjoern@owasp.org'))
    assert.ok(res.text.includes('Name of your favorite pet?'))
  })

  void it('GET erasure form rendering fails for users without assigned security answer', async () => {
    const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

    const res = await request(app)
      .get('/dataerasure/')
      .set({ Cookie: 'token=' + token })

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: No answer found!'))
  })

  void it('GET erasure form rendering fails on unauthenticated access', async () => {
    const res = await request(app)
      .get('/dataerasure/')

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST erasure request does not actually delete the user', async () => {
    const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

    const res = await request(app)
      .post('/dataerasure/')
      .set({ Cookie: 'token=' + token })
      .field('email', 'bjoern.kimminich@gmail.com')

    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))

    const loginRes = await request(app)
      .post('/rest/user/login')
      .set({ 'content-type': 'application/json' })
        .send({ email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

    assert.equal(loginRes.status, 200)
  })

  void it('POST erasure form  fails on unauthenticated access', async () => {
    const res = await request(app)
      .post('/dataerasure/')

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST erasure request with empty layout parameter returns', async () => {
    const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

    const res = await request(app)
      .post('/dataerasure/')
      .set({ Cookie: 'token=' + token })
      .send({ layout: null })

    assert.equal(res.status, 200)
  })

  if (utils.isChallengeEnabled(challenges.lfrChallenge)) {
    void it('POST erasure request with non-existing file path as layout parameter throws error', async () => {
      const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

      const res = await request(app)
        .post('/dataerasure/')
        .set({ Cookie: 'token=' + token })
        .send({ layout: '../this/file/does/not/exist' })

      assert.equal(res.status, 500)
      assert.ok(res.text.includes('no such file or directory'))
    })

    void it('POST erasure request with existing file path as layout parameter returns content truncated', async () => {
      const { token } = await login(app, { email: 'bjoern.kimminich@gmail.com', password: process.env.TEST_BJOERN_PASSWORD ?? (() => { throw new Error('TEST_BJOERN_PASSWORD environment variable is required for tests') })() })

      const res = await request(app)
        .post('/dataerasure/')
        .set({ Cookie: 'token=' + token })
        .send({ layout: '../package.json' })

      assert.equal(res.status, 200)
      assert.ok(res.text.includes('juice-shop'))
      assert.ok(res.text.includes('......'))
    })
  }
})
