/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Sequelize } from 'sequelize'
import * as models from '../../models'

void describe('models/index sequelize export', () => {
  void it('exposes the current sequelize instance', () => {
    assert.ok(models.sequelize instanceof Sequelize)
  })

  void it('cannot be reassigned directly (read-only accessor)', () => {
    assert.throws(() => {
      // @ts-expect-error intentionally attempting an invalid reassignment
      models.sequelize = models.createSequelize({ inMemory: true })
    }, TypeError)
  })

  void it('reflects the instance swapped in via setSequelize', () => {
    const original = models.sequelize
    const storageOf = (seq: Sequelize): string => (seq as unknown as { options: { storage: string } }).options.storage
    assert.equal(storageOf(models.sequelize), 'data/juiceshop.sqlite')
    const replacement = models.createSequelize({ inMemory: true })
    try {
      models.setSequelize(replacement)
      assert.equal(storageOf(models.sequelize), ':memory:')
    } finally {
      models.setSequelize(original)
    }
  })
})
