/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import config from 'config'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express
const subtitlePath = path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
const videoPath = path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.mp4')
let createdSubtitleFile = false

before(async () => {
  if (!fs.existsSync(subtitlePath)) {
    fs.copyFileSync('data/static/owasp_promo.vtt', subtitlePath)
    createdSubtitleFile = true
  }
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

after(() => {
  if (createdSubtitleFile) {
    fs.unlinkSync(subtitlePath)
  }
})

void describe('/promotion', () => {
  void it('GET promotion video page is publicly accessible', async () => {
    const res = await request(app)
      .get('/promotion')
    assert.equal(res.status, 200)
  })

  void it('GET promotion video page contains embedded video', async () => {
    const res = await request(app)
      .get('/promotion')
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('<source src="./video" type="video/mp4">'))
  })

  void it('GET promotion video page contains subtitles as <script>', async () => {
    const res = await request(app)
      .get('/promotion')
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('<script id="subtitle" type="text/vtt" data-label="English" data-lang="en">'))
  })
})

void describe('/video', () => {
  void it('GET promotion video is publicly accessible', async () => {
    const res = await request(app)
      .get('/video')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('video/mp4'))
  })

  void it('GET promotion video supports byte ranges', async () => {
    const videoFileSize = fs.statSync(videoPath).size
    const res = await request(app)
      .get('/video')
      .set('Range', 'bytes=0-15')

    assert.equal(res.status, 206)
    assert.equal(res.headers['accept-ranges'], 'bytes')
    assert.equal(res.headers['content-range'], `bytes 0-15/${videoFileSize}`)
    assert.equal(res.headers['content-length'], '16')
    assert.equal(res.body.length, 16)
  })

  void it('GET promotion video supports open-ended byte ranges', async () => {
    const videoFileSize = fs.statSync(videoPath).size
    const start = videoFileSize - 16
    const res = await request(app)
      .get('/video')
      .set('Range', `bytes=${start}-`)

    assert.equal(res.status, 206)
    assert.equal(res.headers['content-range'], `bytes ${start}-${videoFileSize - 1}/${videoFileSize}`)
    assert.equal(res.headers['content-length'], '16')
    assert.equal(res.body.length, 16)
  })

  void it('GET promotion video uses the default video when configuration value is null', async (t) => {
    const originalGet = config.get.bind(config) as (key: string) => unknown
    t.mock.method(config, 'get', (key: string) => {
      return key === 'application.promotion.video' ? null : originalGet(key)
    })

    const res = await request(app).get('/video')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('video/mp4'))
    assert.equal(res.headers['content-length'], fs.statSync(videoPath).size.toString())
  })
})
