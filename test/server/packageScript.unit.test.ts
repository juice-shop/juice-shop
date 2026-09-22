/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

void describe('scripts/package.mjs', () => {
  void it('should not use the weak MD5 hash algorithm for release checksums', async () => {
    const source = await fs.readFile(path.join(__dirname, '../../scripts/package.mjs'), 'utf8')

    assert.doesNotMatch(source, /createHash\(['"]md5['"]\)/, 'MD5 must not be used for checksum generation')
    assert.match(source, /createHash\(['"]sha256['"]\)/, 'Checksums should be generated with SHA-256')
    assert.match(source, /\.sha256/, 'Checksum files should use the .sha256 extension')
  })
})
