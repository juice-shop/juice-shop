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

void describe('training artifacts', () => {
  for (const path of [
    '/infrastructure/terraform/main.tf',
    '/ftp/legal.md',
    '/ftp/quarantine/juicy_malware_windows_64.exe.url',
    '/encryptionkeys/premium.key',
    '/support/logs/access.log'
  ]) {
    void it(`GET ${path} returns 404`, async () => {
      const res = await request(app).get(path)
      assert.equal(res.status, 404)
    })
  }
})
