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
import type { Product as ProductConfig } from '../../lib/config.types'
import * as utils from '../../lib/utils'

let app: Express

let blueprint: string

for (const product of config.get<ProductConfig[]>('products')) {
  if (product.fileForRetrieveBlueprintChallenge) {
    blueprint = product.fileForRetrieveBlueprintChallenge
    break
  }
}

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('Server', () => {
  void it('GET responds with index.html when visiting application URL', async () => {
    const res = await request(app)
      .get('/')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('scripts.js'))
    assert.ok(res.text.includes('main.js'))
    assert.ok(res.text.includes('polyfills.js'))
  })

  void it('GET responds with index.html when visiting application URL with any path', async () => {
    const res = await request(app)
      .get('/whatever')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('scripts.js'))
    assert.ok(res.text.includes('main.js'))
    assert.ok(res.text.includes('polyfills.js'))
  })

  void it('GET a restricted file directly from file system path on server via URL-encoded Directory Traversal attack loads index.html instead', async () => {
    const res = await request(app)
      .get('/public/images/%2e%2e%2f%2e%2e%2fftp/eastere.gg')
    assert.equal(res.status, 200)
    assert.ok(res.text.includes('<meta name="description" content="Probably the most modern and sophisticated insecure web application">'))
  })

  void it('GET serves a security.txt file', async () => {
    const res = await request(app)
      .get('/security.txt')
    assert.equal(res.status, 200)
  })

  void it('GET serves a security.txt file under well-known subfolder', async () => {
    const res = await request(app)
      .get('/.well-known/security.txt')
    assert.equal(res.status, 200)
  })

  void it('GET serves a robots.txt file', async () => {
    const res = await request(app)
      .get('/robots.txt')
    assert.equal(res.status, 200)
  })

  void it('GET serves a csaf provider-metadata.json', async () => {
    const res = await request(app)
      .get('/.well-known/csaf/provider-metadata.json')
    assert.equal(res.status, 200)
  })

  void it('GET serves a csaf index.txt', async () => {
    const res = await request(app)
      .get('/.well-known/csaf/index.txt')
    assert.equal(res.status, 200)
  })

  void it('GET serves a csaf changes.csv', async () => {
    const res = await request(app)
      .get('/.well-known/csaf/changes.csv')
    assert.equal(res.status, 200)
  })

  void it('GET serves a csaf juice-shop-sa-20200513-express-jwt.json', async () => {
    const res = await request(app)
      .get('/.well-known/csaf/2017/juice-shop-sa-20200513-express-jwt.json')
    assert.equal(res.status, 200)
    assert.ok(res.text.includes('juice-shop-sa-20200513-express-jwt'))
    assert.ok(res.text.includes('We will soon release a patch'))
  })
})

void describe('/public/images/padding', () => {
  void it('GET tracking image for "Score Board" page access challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/padding/1px.png')
    assert.equal(res.status, 200)
    assert.equal(res.headers['content-type'], 'image/png')
  })

  void it('GET tracking image for "Administration" page access challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/padding/19px.png')
    assert.equal(res.status, 200)
    assert.equal(res.headers['content-type'], 'image/png')
  })

  void it('GET tracking image for "Token Sale" page access challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/padding/56px.png')
    assert.equal(res.status, 200)
    assert.equal(res.headers['content-type'], 'image/png')
  })

  void it('GET tracking image for "Privacy Policy" page access challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/padding/81px.png')
    assert.equal(res.status, 200)
    assert.equal(res.headers['content-type'], 'image/png')
  })
})

void describe('/encryptionkeys', () => {
  void it('GET serves a directory listing', async () => {
    const res = await request(app)
      .get('/encryptionkeys')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('<title>listing directory /encryptionkeys</title>'))
  })

  void it('GET a non-existing file in will return a 404 error', async () => {
    const res = await request(app)
      .get('/encryptionkeys/doesnotexist.md')
    assert.equal(res.status, 404)
  })

  void it('GET the Premium Content AES key', async () => {
    const res = await request(app)
      .get('/encryptionkeys/premium.key')
    assert.equal(res.status, 200)
  })

  void it('GET a key file whose name contains a "/" fails with a 403 error', async () => {
    const res = await request(app)
      .get('/encryptionkeys/%2fetc%2fos-release%2500.md')
    assert.equal(res.status, 403)
    assert.ok(res.text.includes('Error: File names cannot contain forward slashes!'))
  })
})

void describe('Hidden URL', () => {
  void it('GET the second easter egg by visiting the Base64>ROT13-decrypted URL', async () => {
    const res = await request(app)
      .get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('<title>Welcome to Planet Orangeuze</title>'))
  })

  void it('GET the premium content by visiting the AES decrypted URL', async () => {
    const res = await request(app)
      .get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
    assert.equal(res.status, 200)
    assert.equal(res.headers['content-type'], 'image/jpeg')
  })

  void it('GET the missing "Thank you!" image for assembling the URL hidden in the Privacy Policy', async () => {
    const res = await request(app)
      .get('/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility')
    assert.equal(res.status, 404)
  })

  void it('GET Klingon translation file for "Extra Language" challenge', async () => {
    const res = await request(app)
      .get('/assets/i18n/tlh_AA.json')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
  })

  void it('GET blueprint file for "Retrieve Blueprint" challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/products/' + blueprint)
    assert.equal(res.status, 200)
  })

  void it('GET crazy cat photo for "Missing Encoding" challenge', async () => {
    const res = await request(app)
      .get('/assets/public/images/uploads/%E1%93%9A%E1%98%8F%E1%97%A2-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg')
    assert.equal(res.status, 200)
  })

  void it('GET folder containing access log files for "Access Log" challenge', async () => {
    const res = await request(app)
      .get('/support/logs/access.log.' + utils.toISO8601(new Date()))
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/octet-stream'))
  })
})
