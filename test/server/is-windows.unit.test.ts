/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import isWindows from '../../lib/is-windows'

void describe('isWindows', () => {
  void it('returns true when OSTYPE is msys', (t) => {
    const originalOstype = process.env.OSTYPE
    process.env.OSTYPE = 'msys'
    t.after(() => {
      if (originalOstype === undefined) {
        delete process.env.OSTYPE
      } else {
        process.env.OSTYPE = originalOstype
      }
    })

    assert.equal(isWindows(), true)
  })

  void it('returns true when OSTYPE is cygwin', (t) => {
    const originalOstype = process.env.OSTYPE
    process.env.OSTYPE = 'cygwin'
    t.after(() => {
      if (originalOstype === undefined) {
        delete process.env.OSTYPE
      } else {
        process.env.OSTYPE = originalOstype
      }
    })

    assert.equal(isWindows(), true)
  })

  void it('returns false when OSTYPE is a non-windows shell', { skip: process.platform === 'win32' }, (t) => {
    const originalOstype = process.env.OSTYPE
    process.env.OSTYPE = 'linux-gnu'
    t.after(() => {
      if (originalOstype === undefined) {
        delete process.env.OSTYPE
      } else {
        process.env.OSTYPE = originalOstype
      }
    })

    assert.equal(isWindows(), false)
  })

  void it('returns false when OSTYPE is not set', { skip: process.platform === 'win32' }, (t) => {
    const originalOstype = process.env.OSTYPE
    delete process.env.OSTYPE
    t.after(() => {
      if (originalOstype === undefined) {
        delete process.env.OSTYPE
      } else {
        process.env.OSTYPE = originalOstype
      }
    })

    assert.equal(isWindows(), false)
  })
})
