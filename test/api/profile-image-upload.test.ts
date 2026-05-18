/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import path from 'node:path'
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
