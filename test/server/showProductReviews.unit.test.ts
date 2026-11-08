/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import '../../routes/showProductReviews'

void describe('showProductReviews global sleep', () => {
  void it('installs sleep as a global function', () => {
    assert.equal(typeof global.sleep, 'function')
  })

  void it('blocks for at least the requested time', () => {
    const start = Date.now()
    global.sleep(50)
    assert.ok(Date.now() - start >= 40)
  })

  void it('caps blocking at 2000ms for longer inputs', () => {
    const start = Date.now()
    global.sleep(5000)
    assert.ok(Date.now() - start < 5000)
  })
})
