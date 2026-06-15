/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import * as Prometheus from 'prom-client'
import config from 'config'
import { createTestApp } from './helpers/setup'
import * as metricsRoute from '../../routes/metrics'
import { challenges } from '../../data/datacache'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app

  // createTestApp calls Prometheus.register.clear() before configureApp, so custom metrics
  // are gone. Re-register them and wire up the /metrics route on the test app.
  const Metrics = metricsRoute.observeMetrics()
  metricsRoute.reRegisterMetrics() // restore module-level counters cleared by register.clear()

  // The update loop fires after 5 s. Use mock timers to trigger one cycle immediately,
  // then restore real timers before the async DB work resolves.
  mock.timers.enable({ apis: ['setInterval'] })
  const loop = Metrics.updateLoop()
  mock.timers.tick(5000)
  clearInterval(loop)
  mock.timers.reset()

  // Poll until coding_challenges_progress has actual value lines (written after the
  // async Promise.all inside the update loop). Gauges appear in the registry immediately
  // on creation (as # HELP/# TYPE lines), but value lines only appear after .set() is called.
  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    const text = await Prometheus.register.metrics()
    if (/juiceshop_coding_challenges_progress\{phase="find it"/.test(text)) break
    await new Promise<void>(resolve => setTimeout(resolve, 50))
  }
}, { timeout: 60000 })

void describe('/metrics', () => {
  void describe('challenge tracking', () => {
    before(() => {
      challenges.exposedMetricsChallenge.solved = false
    })

    void it('GET with an ignored scraper user agent does not solve exposedMetricsChallenge', async () => {
      const ignoredAgents = config.get<string[]>('challenges.metricsIgnoredUserAgents')

      await request(app)
        .get('/metrics')
        .set('User-Agent', `${ignoredAgents[0]}/2.45.0`)

      assert.equal(challenges.exposedMetricsChallenge.solved, false)
    })

    void it('GET with a regular browser user agent solves exposedMetricsChallenge', async () => {
      await request(app)
        .get('/metrics')
        .set('User-Agent', 'Mozilla/5.0 (compatible; browser)')

      assert.equal(challenges.exposedMetricsChallenge.solved, true)
    })
  })

  void describe('response format', () => {
    void it('GET returns 200 with text/plain content type', async () => {
      const res = await request(app).get('/metrics')

      assert.equal(res.status, 200)
      assert.ok(res.headers['content-type']?.includes('text/plain'))
    })
  })

  void describe('update loop', { concurrency: 1 }, () => {
    void it('GET includes version info gauge after update loop runs', async () => {
      const res = await request(app).get('/metrics')

      assert.match(
        res.text,
        /^.*_version_info\{version="[0-9]+\.[0-9]+\.[0-9]+(-SNAPSHOT)?",major="[0-9]+",minor="[0-9]+",patch="[0-9]+",app=".*"\} 1$/m
      )
    })

    void it('GET includes per-difficulty and per-category challenge solved/total gauges', async () => {
      const res = await request(app).get('/metrics')

      assert.match(res.text, /^.*_challenges_solved\{difficulty="[1-6]",category=".+",app=".*"\} [0-9]+$/m)
      assert.match(res.text, /^.*_challenges_total\{difficulty="[1-6]",category=".+",app=".*"\} [0-9]+$/m)
    })

    void it('GET includes cheat score gauge', async () => {
      const res = await request(app).get('/metrics')

      assert.match(res.text, /^.*_cheat_score\{app=".*"\} [0-9.]+$/m)
    })

    void it('GET includes coding challenge progress gauges for all three phases', async () => {
      const res = await request(app).get('/metrics')

      assert.match(res.text, /^.*_coding_challenges_progress\{phase="find it",app=".*"\} [0-9]+$/m)
      assert.match(res.text, /^.*_coding_challenges_progress\{phase="fix it",app=".*"\} [0-9]+$/m)
      assert.match(res.text, /^.*_coding_challenges_progress\{phase="unsolved",app=".*"\} [0-9]+$/m)
    })

    void it('GET includes registered user counts from update loop', async () => {
      const res = await request(app).get('/metrics')

      assert.match(res.text, /^.*_users_registered_total\{app=".*"\} [0-9]+$/m)
    })

    void it('GET includes http request counter incremented by the request middleware', async () => {
      const res = await request(app).get('/metrics')

      assert.match(res.text, /^http_requests_count\{status_code="2XX",app=".*"\} [0-9]+$/m)
    })
  })

  void describe('file upload metrics', () => {
    void it('GET includes file upload success counter after a valid upload', async () => {
      const file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')

      await request(app)
        .post('/file-upload')
        .attach('file', fs.readFileSync(file), 'validSizeAndTypeForClient.pdf')
        .expect(204)

      const res = await request(app).get('/metrics')

      assert.match(res.text, /^file_uploads_count\{file_type=".*",app=".*"\} [0-9]+$/m)
    })

    void it('GET includes file upload error counter after an upload that triggers a downstream error', async () => {
      // An XML file passes the multer size limit so req.file is set, but handleXmlUpload
      // sends a 410 response, which causes the onFinished callback to count it as an error.
      await request(app)
        .post('/file-upload')
        .attach('file', Buffer.from('<?xml version="1.0"?><root/>'), { filename: 'test.xml', contentType: 'application/xml' })
        .expect(410)

      const res = await request(app).get('/metrics')

      assert.match(res.text, /^file_upload_errors\{file_type=".*",app=".*"\} [0-9]+$/m)
    })
  })
})
