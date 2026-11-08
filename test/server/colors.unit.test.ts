/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { styleText } from 'node:util'
import colors from '../../lib/colors'

void describe('colors', () => {
  const styles = ['bold', 'italic', 'red', 'green', 'yellow', 'cyan'] as const

  for (const style of styles) {
    void it(`applies the ${style} style like node:util styleText`, () => {
      assert.equal(colors[style]('text'), styleText(style, 'text'))
    })
  }

  void it('maps grey to the gray style', () => {
    assert.equal(colors.grey('text'), styleText('gray', 'text'))
  })

  void it('coerces non-string input instead of throwing', () => {
    for (const style of styles) {
      assert.doesNotThrow(() => colors[style](123))
      assert.match(String(colors[style](123)), /123/)
    }
    assert.doesNotThrow(() => colors.grey(123))
    assert.match(String(colors.grey(123)), /123/)
  })
})
