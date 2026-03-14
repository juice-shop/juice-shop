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

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/redirect', () => {
  void it('GET redirected to https://github.com/juice-shop/juice-shop when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=https://github.com/juice-shop/juice-shop')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to http://shop.spreadshirt.com/juiceshop when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=http://shop.spreadshirt.com/juiceshop')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to http://shop.spreadshirt.de/juiceshop when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=http://shop.spreadshirt.de/juiceshop')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to https://www.stickeryou.com/products/owasp-juice-shop/794 when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=https://www.stickeryou.com/products/owasp-juice-shop/794')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET redirected to https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 when this URL is passed as "to" parameter', async () => {
    const res = await request(app)
      .get('/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6')
      .redirects(0)
    assert.equal(res.status, 302)
  })

  void it('GET error message with information leakage when calling /redirect without query parameter', async () => {
    const res = await request(app)
      .get('/redirect')
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('TypeError'))
    assert.ok(res.text.includes('of undefined'))
    assert.ok(res.text.includes('&#39;includes&#39;'))
  })

  void it('GET error message with information leakage when calling /redirect with unrecognized query parameter', async () => {
    const res = await request(app)
      .get('/redirect?x=y')
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('TypeError'))
    assert.ok(res.text.includes('of undefined'))
    assert.ok(res.text.includes('&#39;includes&#39;'))
  })

  void it('GET error message hinting at allowlist validation when calling /redirect with an unrecognized "to" target', async () => {
    const res = await request(app)
      .get('/redirect?to=whatever')
    assert.equal(res.status, 406)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('Unrecognized target URL for redirect: whatever'))
  })

  void it('GET redirected to target URL in "to" parameter when a allow-listed URL is part of the query string', async () => {
    const res = await request(app)
      .get('/redirect?to=/score-board?satisfyIndexOf=https://github.com/juice-shop/juice-shop')
      .redirects(1)
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('main.js'))
    assert.ok(res.text.includes('scripts.js'))
    assert.ok(res.text.includes('polyfills.js'))
  })
})
