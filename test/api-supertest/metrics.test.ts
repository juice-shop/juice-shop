/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/metrics', () => {
  void it('GET metrics via public API that are available instantaneously', { skip: 'FIXME Flaky on CI/CD on at least Windows' }, async () => {
    const res = await request(app)
      .get('/metrics')
      .expect(200)

    assert.ok(res.headers['content-type']?.includes('text/plain'))
    assert.match(res.text, /^.*_version_info{version="[0-9]+.[0-9]+.[0-9]+(-SNAPSHOT)?",major="[0-9]+",minor="[0-9]+",patch="[0-9]+",app=".*"} 1$/gm)
    assert.match(res.text, /^.*_challenges_solved{difficulty="[1-6]",category=".*",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_challenges_total{difficulty="[1-6]",category=".*",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_cheat_score{app=".*"} [0-9.]*$/gm)
    assert.match(res.text, /^.*_orders_placed_total{app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_users_registered{type="standard",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_users_registered{type="deluxe",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_users_registered_total{app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_wallet_balance_total{app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_user_social_interactions{type="review",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_user_social_interactions{type="feedback",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^.*_user_social_interactions{type="complaint",app=".*"} [0-9]*$/gm)
    assert.match(res.text, /^http_requests_count{status_code="[0-9]XX",app=".*"} [0-9]*$/gm)
  })

  void it('GET file upload metrics via public API', { skip: 'FIXME Flaky on CI/CD on at least Windows' }, async () => {
    const file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')

    await request(app)
      .post('/file-upload')
      .attach('file', fs.readFileSync(file), 'validSizeAndTypeForClient.pdf')
      .expect(204)

    const res = await request(app)
      .get('/metrics')
      .expect(200)

    assert.ok(res.headers['content-type']?.includes('text/plain'))
    assert.match(res.text, /^file_uploads_count{file_type=".*",app=".*"} [0-9]*$/gm)
  })

  void it('GET file upload error metrics via public API', { skip: 'FIXME Flaky on CI/CD on at least Windows' }, async () => {
    const file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')

    await request(app)
      .post('/file-upload')
      .attach('file', fs.readFileSync(file), 'invalidSizeForServer.pdf')
      .expect(500)

    const res = await request(app)
      .get('/metrics')
      .expect(200)

    assert.ok(res.headers['content-type']?.includes('text/plain'))
    assert.match(res.text, /^file_upload_errors{file_type=".*",app=".*"} [0-9]*$/gm)
  })
})
