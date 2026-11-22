/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { getPaymentMethods, getPaymentMethodById, delPaymentMethodById } from '../../routes/payment'
import { CardModel } from '../../models/card'

const CARD_A = { UserId: 7, id: 1, fullName: 'Maria Silva', cardNum: 1234567812345678, expMonth: 12, expYear: 2090 }
const CARD_B = { UserId: 7, id: 2, fullName: 'Maria Silva', cardNum: 8765432187654321, expMonth: 1, expYear: 2085 }

void describe('payment', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    mock.restoreAll()
    req = { params: {}, body: { UserId: 7 } }
    res = { json: mock.fn(), status: mock.fn(() => res) }
    next = mock.fn()
  })

  void describe('getPaymentMethods', () => {
    void it('should return all cards of the user with masked card numbers', async () => {
      mock.method(CardModel, 'findAll', async () => [CARD_A, CARD_B])

      await getPaymentMethods()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      const body = res.json.mock.calls[0].arguments[0]
      assert.equal(body.status, 'success')
      assert.equal(body.data.length, 2)
      assert.equal(body.data[0].cardNum, '************5678')
      assert.equal(body.data[1].cardNum, '************4321')
      assert.equal(body.data[0].fullName, 'Maria Silva')
    })

    void it('should query only the cards of the authenticated user', async () => {
      const findAll = mock.method(CardModel, 'findAll', async () => [])

      await getPaymentMethods()(req, res, next)

      assert.deepEqual(findAll.mock.calls[0].arguments[0], { where: { UserId: 7 } })
    })

    void it('should return an empty list when the user has no cards (boundary)', async () => {
      mock.method(CardModel, 'findAll', async () => [])

      await getPaymentMethods()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      assert.deepEqual(res.json.mock.calls[0].arguments[0], { status: 'success', data: [] })
    })

    void it('should never expose the full card number', async () => {
      mock.method(CardModel, 'findAll', async () => [CARD_A])

      await getPaymentMethods()(req, res, next)

      const serialized = JSON.stringify(res.json.mock.calls[0].arguments[0])
      assert.equal(serialized.includes('12345678'), false)
    })

    void it('should reject when the database fails (module has no own error handling)', async () => {
      mock.method(CardModel, 'findAll', async () => { throw new Error('db down') })

      await assert.rejects(getPaymentMethods()(req, res, next), /db down/)
      assert.equal(res.status.mock.callCount(), 0)
    })
  })

  void describe('getPaymentMethodById', () => {
    void it('should return the masked card when it exists and belongs to the user', async () => {
      req.params.id = '1'
      mock.method(CardModel, 'findOne', async () => CARD_A)

      await getPaymentMethodById()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      const body = res.json.mock.calls[0].arguments[0]
      assert.equal(body.status, 'success')
      assert.equal(body.data.id, 1)
      assert.equal(body.data.cardNum, '************5678')
    })

    void it('should filter by card id and by the authenticated user', async () => {
      req.params.id = '1'
      const findOne = mock.method(CardModel, 'findOne', async () => CARD_A)

      await getPaymentMethodById()(req, res, next)

      assert.deepEqual(findOne.mock.calls[0].arguments[0], { where: { id: '1', UserId: 7 } })
    })

    void it('should answer 400 when the card does not exist or belongs to another user', async () => {
      req.params.id = '99'
      mock.method(CardModel, 'findOne', async () => null)

      await getPaymentMethodById()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 400)
      assert.deepEqual(res.json.mock.calls[0].arguments[0], { status: 'error', data: 'Malicious activity detected' })
    })

    void it('should reject when the database fails', async () => {
      req.params.id = '1'
      mock.method(CardModel, 'findOne', async () => { throw new Error('db down') })

      await assert.rejects(getPaymentMethodById()(req, res, next), /db down/)
    })
  })

  void describe('delPaymentMethodById', () => {
    void it('should delete the card and answer 200', async () => {
      req.params.id = '1'
      const destroy = mock.method(CardModel, 'destroy', async () => 1)

      await delPaymentMethodById()(req, res, next)

      assert.deepEqual(destroy.mock.calls[0].arguments[0], { where: { id: '1', UserId: 7 } })
      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      assert.deepEqual(res.json.mock.calls[0].arguments[0], { status: 'success', data: 'Card deleted successfully.' })
    })

    void it('should answer 400 when nothing was deleted', async () => {
      req.params.id = '99'
      mock.method(CardModel, 'destroy', async () => 0)

      await delPaymentMethodById()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 400)
      assert.deepEqual(res.json.mock.calls[0].arguments[0], { status: 'error', data: 'Malicious activity detected.' })
    })

    void it('should reject when the database fails', async () => {
      req.params.id = '1'
      mock.method(CardModel, 'destroy', async () => { throw new Error('db down') })

      await assert.rejects(delPaymentMethodById()(req, res, next), /db down/)
    })
  })
})