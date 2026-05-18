/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

function responseText (res: request.Response): string {
  return res.text ?? (Buffer.isBuffer(res.body) ? res.body.toString('utf-8') : '')
}

void describe('/ftp', () => {
  void it('GET serves a directory listing', async () => {
    const res = await request(app)
      .get('/ftp')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('<title>listing directory /ftp</title>'))
  })

  void it('GET a non-existing Markdown file in /ftp will return a 404 error', async () => {
    const res = await request(app)
      .get('/ftp/doesnotexist.md')
    assert.equal(res.status, 404)
  })

  void it('GET a non-existing PDF file in /ftp will return a 404 error', async () => {
    const res = await request(app)
      .get('/ftp/doesnotexist.pdf')
    assert.equal(res.status, 404)
  })

  void it('GET a non-existing file in /ftp will return a 403 error for invalid file type', async () => {
    const res = await request(app)
      .get('/ftp/doesnotexist.exe')
    assert.equal(res.status, 403)
  })

  void it('GET an existing file in /ftp will return a 403 error for invalid file type .gg', async () => {
    const res = await request(app)
      .get('/ftp/eastere.gg')
    assert.equal(res.status, 403)
  })

  void it('GET existing file /ftp/coupons_2013.md.bak will return a 403 error for invalid file type .bak', async () => {
    const res = await request(app)
      .get('/ftp/coupons_2013.md.bak')
    assert.equal(res.status, 403)
  })

  void it('GET existing file /ftp/package.json.bak will return a 403 error for invalid file type .bak', async () => {
    const res = await request(app)
      .get('/ftp/package.json.bak')
    assert.equal(res.status, 403)
  })

  void it('GET existing file /ftp/suspicious_errors.yml will return a 403 error for invalid file type .yml', async () => {
    const res = await request(app)
      .get('/ftp/suspicious_errors.yml')
    assert.equal(res.status, 403)
  })

  void it('GET the confidential file in /ftp', async () => {
    const res = await request(app)
      .get('/ftp/acquisitions.md')
    assert.equal(res.status, 200)
    assert.ok(res.text.includes('# Planned Acquisitions'))
  })

  void it('GET the KeePass database in /ftp', async () => {
    const res = await request(app)
      .get('/ftp/incident-support.kdbx')
    assert.equal(res.status, 200)
  })

  void it('GET the easter egg file by using Poison Null Byte attack with .pdf suffix', async () => {
    const res = await request(app)
      .get('/ftp/eastere.gg%2500.pdf')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('Congratulations, you found the easter egg!'))
  })

  void it('GET the easter egg file by using Poison Null Byte attack with .md suffix', async () => {
    const res = await request(app)
      .get('/ftp/eastere.gg%2500.md')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('Congratulations, you found the easter egg!'))
  })

  void it('GET the SIEM signature file by using Poison Null Byte attack with .pdf suffix', async () => {
    const res = await request(app)
      .get('/ftp/suspicious_errors.yml%2500.pdf')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('Suspicious error messages specific to the application'))
  })

  void it('GET the SIEM signature file by using Poison Null Byte attack with .md suffix', async () => {
    const res = await request(app)
      .get('/ftp/suspicious_errors.yml%2500.md')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('Suspicious error messages specific to the application'))
  })

  void it('GET the 2013 coupon code file by using Poison Null Byte attack with .pdf suffix', async () => {
    const res = await request(app)
      .get('/ftp/coupons_2013.md.bak%2500.pdf')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('n<MibgC7sn'))
  })

  void it('GET the 2013 coupon code file by using an Poison Null Byte attack with .md suffix', async () => {
    const res = await request(app)
      .get('/ftp/coupons_2013.md.bak%2500.md')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('n<MibgC7sn'))
  })

  void it('GET the package.json.bak file by using Poison Null Byte attack with .pdf suffix', async () => {
    const res = await request(app)
      .get('/ftp/package.json.bak%2500.pdf')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('"name": "juice-shop",'))
  })

  void it('GET the package.json.bak file by using Poison Null Byte attack with .md suffix', async () => {
    const res = await request(app)
      .get('/ftp/package.json.bak%2500.md')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('"name": "juice-shop",'))
  })

  void it('GET a restricted file directly from file system path on server by tricking route definitions fails with 403 error', async () => {
    const res = await request(app)
      .get('/ftp///eastere.gg')
    assert.equal(res.status, 403)
  })

  void it('GET a restricted file directly from file system path on server by appending URL parameter fails with 403 error', async () => {
    const res = await request(app)
      .get('/ftp/eastere.gg?.md')
    assert.equal(res.status, 403)
  })

  void it('GET a file whose name contains a "/" fails with a 403 error', async () => {
    const res = await request(app)
      .get('/ftp/%2fetc%2fos-release%2500.md')
    assert.equal(res.status, 403)
    assert.ok(res.text.includes('Error: File names cannot contain forward slashes!'))
  })

  void it('GET an accessible file directly from file system path on server', async () => {
    const res = await request(app)
      .get('/ftp/legal.md')
    assert.equal(res.status, 200)
    assert.ok(res.text.includes('# Legal Information'))
  })

  void it('GET a non-existing file via direct server file path /ftp will return a 404 error', async () => {
    const res = await request(app)
      .get('/ftp/doesnotexist.md')
    assert.equal(res.status, 404)
  })

  void it('GET the package.json.bak file contains a dependency on epilogue-js for "Typosquatting" challenge', async () => {
    const res = await request(app)
      .get('/ftp/package.json.bak%2500.md')
      .buffer(true)
    assert.equal(res.status, 200)
    assert.ok(responseText(res).includes('"epilogue-js": "~0.7",'))
  })

  void it('GET file /ftp/quarantine/juicy_malware_linux_amd_64.url', async () => {
    const res = await request(app)
      .get('/ftp/quarantine/juicy_malware_linux_amd_64.url')
    assert.equal(res.status, 200)
  })

  void it('GET file /ftp/quarantine/juicy_malware_linux_arm_64.url', async () => {
    const res = await request(app)
      .get('/ftp/quarantine/juicy_malware_linux_arm_64.url')
    assert.equal(res.status, 200)
  })

  void it('GET existing file /ftp/quarantine/juicy_malware_macos_64.url', async () => {
    const res = await request(app)
      .get('/ftp/quarantine/juicy_malware_macos_64.url')
    assert.equal(res.status, 200)
  })

  void it('GET existing file /ftp/quarantine/juicy_malware_windows_64.exe.url', async () => {
    const res = await request(app)
      .get('/ftp/quarantine/juicy_malware_windows_64.exe.url')
    assert.equal(res.status, 200)
  })
})
