/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { b2bOrder } from '../../routes/b2bOrder'

void describe('b2bOrder', () => {
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = { body: { } }
    res = { json: mock.fn(), status: mock.fn() }
    next = mock.fn()
    save = () => ({
      then () { }
    })
    challenges.rceChallenge = { solved: false, save } as unknown as Challenge
  })

  void it('infinite loop payload does not succeed but solves "rceChallenge"', { skip: true }, () => {
    req.body.orderLinesData = '(function dos() { while(true); })()'

    b2bOrder()(req, res, next)

    assert.equal(challenges.rceChallenge.solved, true)
  })

  void it('timeout after 2 seconds solves "rceOccupyChallenge"', { skip: true }, () => {
    req.body.orderLinesData = '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'

    b2bOrder()(req, res, next)

    assert.equal(challenges.rceOccupyChallenge.solved, true)
  })

  void it('deserializing JSON as documented in Swagger should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{"productId": 12,"quantity": 10000,"customerReference": ["PO0000001.2", "SM20180105|042"],"couponCode": "pes[Bh.u*t"}'

    b2bOrder()(req, res, next)

    assert.equal(challenges.rceChallenge.solved, false)
  })

  void it('deserializing arbitrary JSON should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{"hello": "world", "foo": 42, "bar": [false, true]}'

    b2bOrder()(req, res, next)
    assert.equal(challenges.rceChallenge.solved, false)
  })

  void it('deserializing broken JSON should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{ "productId: 28'

    b2bOrder()(req, res, next)

    assert.equal(challenges.rceChallenge.solved, false)
  })
})
