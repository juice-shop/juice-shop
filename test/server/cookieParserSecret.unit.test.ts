/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

void describe('cookie-parser secret', () => {
  const serverSource = fs.readFileSync(path.resolve(__dirname, '../../server.ts'), 'utf8')

  void it('does not use the previously leaked hardcoded "kekse" secret', () => {
    assert.equal(serverSource.includes("cookieParser('kekse')"), false)
  })

  void it('derives the cookie-parser secret from a securely generated random value', () => {
    assert.match(serverSource, /cookieParser\(crypto\.randomBytes\(\d+\)\.toString\('hex'\)\)/)
  })
})
