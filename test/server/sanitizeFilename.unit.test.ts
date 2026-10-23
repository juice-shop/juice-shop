/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import sanitizeFilename from '../../lib/sanitizeFilename'

void describe('sanitizeFilename', () => {
  void it('removes illegal characters', () => {
    assert.equal(sanitizeFilename('file/name.txt'), 'filename.txt')
    assert.equal(sanitizeFilename('../../etc/passwd'), '....etcpasswd')
    assert.equal(sanitizeFilename('foo?bar<baz>qux:quux*corge|grault"garply.txt'), 'foobarbazquxquuxcorgegraultgarply.txt')
  })

  void it('removes control characters', () => {
    assert.equal(sanitizeFilename('foo\x00bar\x1f.txt'), 'foobar.txt')
  })

  void it('removes windows reserved filenames', () => {
    assert.equal(sanitizeFilename('CON'), '')
    assert.equal(sanitizeFilename('aux.txt'), '')
    assert.equal(sanitizeFilename('com1.png'), '')
    assert.equal(sanitizeFilename('lpt9.tar.gz'), '')
  })

  void it('removes trailing dots and spaces', () => {
    assert.equal(sanitizeFilename('filename...  '), 'filename')
  })

  void it('supports custom replacement string', () => {
    assert.equal(sanitizeFilename('file/name.txt', { replacement: '_' }), 'file_name.txt')
  })

  void it('throws on non-string input', () => {
    assert.throws(() => sanitizeFilename(123 as any), /Input must be string/)
  })
})
