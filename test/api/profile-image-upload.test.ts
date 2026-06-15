/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import path from 'node:path'
import http from 'node:http'
import fs from 'node:fs'
import { type AddressInfo } from 'node:net'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/profile/image/file', () => {
  void it('POST profile image file valid for JPG format', async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', file)
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image file invalid type', async () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', file)

    assert.equal(res.status, 415)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('Error: Profile image upload does not accept this file type'))
  })

  void it('POST profile image file forbidden for anonymous user', async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const res = await request(app)
      .post('/profile/image/file')
      .attach('file', file)

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST profile image file rejected for unrecognizable file content', async () => {
    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from('not an image, just plain text content'), 'random.bin')

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Illegal file type'))
  })
})

void describe('/profile/image/url', () => {
  void it('POST profile image URL valid for image available online', async () => {
    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'cataas.com/cat')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image URL redirects even for invalid image URL', async () => {
    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://notanimage.here/100/100')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image URL forbidden for anonymous user', { skip: 'FIXME runs into "socket hang up"' }, async () => {
    const res = await request(app)
      .post('/profile/image/url')
      .field('imageUrl', 'cataas.com/cat')

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST valid image with tampered content length', { skip: 'Fails on CI/CD pipeline' }, async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .set('Content-Length', '42')
      .attach('file', file)
      .redirects(0)

    assert.equal(res.status, 500)
    assert.ok(res.text.includes('Unexpected end of form'))
  })
})

void describe('/profile/image/url (with local mock server)', () => {
  let mockServer: http.Server
  let mockPort: number
  let token: string
  let userId: number

  before(async () => {
    const { token: userToken } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })
    token = userToken
    userId = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).data.id

    const imageBuffer = fs.readFileSync(path.resolve(__dirname, '../files/validProfileImage.jpg'))

    mockServer = http.createServer((req, res) => {
      if (req.url?.includes('non-ok')) {
        res.statusCode = 404
        res.end()
      } else if (req.url?.includes('no-body')) {
        res.statusCode = 204
        res.end()
      } else {
        res.statusCode = 200
        res.setHeader('Content-Type', 'image/jpeg')
        res.end(imageBuffer)
      }
    })
    await new Promise<void>((resolve) => { mockServer.listen(0, resolve) })
    mockPort = (mockServer.address() as AddressInfo).port
  })

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      mockServer.close((err) => { err != null ? reject(err) : resolve() })
    })
  })

  void it('POST with non-OK response falls back to storing URL as profile image', async () => {
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', `http://localhost:${mockPort}/non-ok.jpg`)
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST with empty-body response (204) falls back to storing URL as profile image', async () => {
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', `http://localhost:${mockPort}/no-body.jpg`)
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST with valid response writes file and redirects to profile', async () => {
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', `http://localhost:${mockPort}/photo.jpg`)
      .redirects(0)

    assert.equal(res.status, 302)
    assert.ok(res.headers.location?.endsWith('/profile'))
  })

  void it('POST with PNG URL extension saves file using PNG extension', async () => {
    await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', `http://localhost:${mockPort}/photo.png`)
      .redirects(0)

    assert.ok(
      fs.existsSync(`frontend/dist/frontend/assets/public/images/uploads/${userId}.png`),
      `Expected file frontend/dist/frontend/assets/public/images/uploads/${userId}.png to exist`
    )
  })

  void it('POST with unrecognised URL extension defaults to JPG extension', async () => {
    await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', `http://localhost:${mockPort}/photo.bmp`)
      .redirects(0)

    assert.ok(
      fs.existsSync(`frontend/dist/frontend/assets/public/images/uploads/${userId}.jpg`),
      `Expected file frontend/dist/frontend/assets/public/images/uploads/${userId}.jpg to exist`
    )
  })
})
