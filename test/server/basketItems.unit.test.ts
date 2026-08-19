/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { quantityCheckBeforeBasketItemUpdate } from '../../routes/basketItems'
import { BasketItemModel } from '../../models/basketitem'
import { QuantityModel } from '../../models/quantity'

void describe('basketItems', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { params: { id: '1' }, body: { quantity: 5 }, headers: {}, __: mock.fn((s) => s) }
    res = { json: mock.fn(), status: mock.fn(() => res) }
    next = mock.fn()
    mock.restoreAll()
  })

  void it('should call next with error if QuantityModel.findOne fails during update', async () => {
    const error = new Error('Database connection failed')
    mock.method(BasketItemModel, 'findOne', async () => ({ ProductId: 1 }))
    mock.method(QuantityModel, 'findOne', async () => { throw error })

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    void quantityCheckBeforeBasketItemUpdate()(req, res, next)
    const err = await p as Error

    assert.equal(err, error)
  })
})
