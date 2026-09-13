/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { placeOrder } from '../../routes/order'
import { BasketModel } from '../../models/basket'
import { BasketItemModel } from '../../models/basketitem'
import { QuantityModel } from '../../models/quantity'
import { WalletModel } from '../../models/wallet'
import { DeliveryModel } from '../../models/delivery'
import * as db from '../../data/mongodb'
import * as security from '../../lib/insecurity'

// Wait for asynchronous PDF cleanup after the order fails.
async function waitForOrderPdfFiles (before: string[], timeoutMs = 2000): Promise<string[]> {
  const deadline = Date.now() + timeoutMs
  let current = listOrderPdfFiles()
  while (current.length > before.length && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20))
    current = listOrderPdfFiles()
  }
  return current.filter((file) => !before.includes(file))
}

function listOrderPdfFiles (): string[] {
  return fs.readdirSync('ftp/').filter((file) => file.startsWith('order_') && file.endsWith('.pdf'))
}

void describe('order', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { params: { id: '1' }, body: {}, headers: {}, __: mock.fn((s) => s), socket: { remoteAddress: '127.0.0.1' } }
    res = { json: mock.fn(), status: mock.fn(() => res) }
    next = mock.fn()
    // Reset mocks that might have been set globally or on models
    mock.restoreAll()
  })

  void it('should call next with error if basket does not exist', async () => {
    mock.method(BasketModel, 'findOne', async () => null)

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p as Error

    assert.match(err.message, /Basket with id=1 does not exist/)
  })

  void it('should call next with error if QuantityModel.findOne fails', async () => {
    const basket = {
      id: 1,
      Products: [{
        BasketItem: { ProductId: 1, quantity: 1 },
        price: 10,
        deluxePrice: 5,
        name: 'Product 1',
        id: 1
      }],
      update: mock.fn()
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    const error = new Error('Quantity error')
    mock.method(QuantityModel, 'findOne', async () => { throw error })

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
  })

  void it('should call next with error if QuantityModel.update fails', async () => {
    const basket = {
      id: 1,
      Products: [{
        BasketItem: { ProductId: 1, quantity: 1 },
        price: 10,
        deluxePrice: 5,
        name: 'Product 1',
        id: 1
      }],
      update: mock.fn()
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(QuantityModel, 'findOne', async () => ({ quantity: 10 }))
    const error = new Error('Quantity update error')
    mock.method(QuantityModel, 'update', async () => { throw error })
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should call next with error if WalletModel.decrement fails', async () => {
    const basket = {
      id: 1,
      Products: [{
        BasketItem: { ProductId: 1, quantity: 1 },
        price: 100,
        deluxePrice: 100,
        name: 'Expensive Product',
        id: 1
      }],
      update: mock.fn()
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(QuantityModel, 'findOne', async () => ({ quantity: 10 }))
    mock.method(QuantityModel, 'update', async () => [1])
    req.body.UserId = 1
    req.body.orderDetails = { paymentId: 'wallet' }
    mock.method(WalletModel, 'findOne', async () => ({ balance: 1000 }))
    const error = new Error('Wallet decrement error')
    mock.method(WalletModel, 'decrement', async () => { throw error })
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should call next with error if WalletModel.increment fails', async () => {
    const basket = {
      id: 1,
      Products: [{
        BasketItem: { ProductId: 1, quantity: 1 },
        price: 10,
        deluxePrice: 5,
        name: 'Product 1',
        id: 1
      }],
      update: mock.fn(),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(QuantityModel, 'findOne', async () => ({ quantity: 10 }))
    mock.method(QuantityModel, 'update', async () => [1])
    req.body.UserId = 1
    const error = new Error('Wallet increment error')
    mock.method(WalletModel, 'increment', async () => { throw error })
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should call next with error if DeliveryModel.findOne fails', async () => {
    const basket = {
      id: 1,
      Products: [],
      update: mock.fn(),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    req.body.orderDetails = { deliveryMethodId: 1 }
    const error = new Error('Delivery error')
    mock.method(DeliveryModel, 'findOne', async () => { throw error })
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should call next with error if ordersCollection.insert fails', async () => {
    const basket = {
      id: 1,
      Products: [],
      update: mock.fn(),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    const error = new Error('Insert error')
    mock.method(db.ordersCollection, 'insert', async () => { throw error })
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should call next with error if BasketItemModel.destroy fails', async () => {
    const basket = {
      id: 1,
      Products: [],
      update: mock.fn(async () => {}),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    const error = new Error('Destroy error')
    mock.method(BasketItemModel, 'destroy', async () => { throw error })
    mock.method(db.ordersCollection, 'insert', async () => {})
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p

    assert.equal(err, error)
    // Clean up the PDF created by the successful order.
    for (const file of listOrderPdfFiles().filter((f) => !filesBefore.includes(f))) {
      fs.unlinkSync(`ftp/${file}`)
    }
  })

  void it('should handle base64 coupon data in calculateApplicableDiscount', async () => {
    const validOn = new Date('Mar 08, 2019 00:00:00 GMT+0100').getTime()
    const couponData = Buffer.from(`WMNSDY2019-${validOn}`).toString('base64')
    req.body.couponData = couponData

    const basket = {
      id: 1,
      Products: [],
      update: mock.fn(async () => {}),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(db.ordersCollection, 'insert', async () => {})
    mock.method(BasketItemModel, 'destroy', async () => {})
    mock.method(WalletModel, 'increment', async () => {})
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      res.json = (data: any) => { resolve(data) }
    })

    placeOrder()(req, res, next)
    await p

    assert.ok(true)
    for (const file of listOrderPdfFiles().filter((f) => !filesBefore.includes(f))) {
      fs.unlinkSync(`ftp/${file}`)
    }
  })

  void it('should call next with error if wallet balance is insufficient', async () => {
    const basket = {
      id: 1,
      Products: [{
        BasketItem: { ProductId: 1, quantity: 1 },
        price: 100,
        deluxePrice: 100,
        name: 'Expensive Product',
        id: 1
      }],
      update: mock.fn()
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(QuantityModel, 'findOne', async () => ({ quantity: 10 }))
    mock.method(QuantityModel, 'update', async () => [1])
    req.body.UserId = 1
    req.body.orderDetails = { paymentId: 'wallet' }
    mock.method(WalletModel, 'findOne', async () => ({ balance: 10 }))
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      next = (err: any) => { resolve(err) }
    })

    placeOrder()(req, res, next)
    const err = await p as Error

    assert.match(err.message, /Insufficient wallet balance/)
    assert.deepEqual(await waitForOrderPdfFiles(filesBefore), [], 'the half-written order PDF should not be left behind in ftp/')
  })

  void it('should keep the order pdf file in ftp/ after a successful order', async () => {
    const basket = {
      id: 1,
      Products: [],
      update: mock.fn(async () => {}),
      coupon: null
    }
    mock.method(BasketModel, 'findOne', async () => basket)
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { email: 'test@juice-sh.op' } }))
    mock.method(db.ordersCollection, 'insert', async () => {})
    mock.method(BasketItemModel, 'destroy', async () => {})
    mock.method(WalletModel, 'increment', async () => {})
    const filesBefore = listOrderPdfFiles()

    const p = new Promise((resolve) => {
      res.json = (data: any) => { resolve(data) }
    })

    placeOrder()(req, res, next)
    await p

    const newFiles = listOrderPdfFiles().filter((file) => !filesBefore.includes(file))
    assert.equal(newFiles.length, 1, 'a completed order should still produce its confirmation PDF')
    fs.unlinkSync(`ftp/${newFiles[0]}`)
  })
})
