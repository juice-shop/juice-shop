/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { dataExport } from '../../routes/dataExport'
import * as security from '../../lib/insecurity'
import { MemoryModel } from '../../models/memory'
import * as db from '../../data/mongodb'

void describe('dataExport', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { headers: {}, body: {}, protocol: 'http', get: mock.fn(() => 'localhost'), socket: { remoteAddress: '127.0.0.1' } }
    res = { status: mock.fn(() => res), send: mock.fn(), json: mock.fn() }
    next = mock.fn()
  })

  void it('should call next with error if user is not authenticated', async () => {
    mock.method(security.authenticatedUsers, 'get', () => undefined)

    await dataExport()(req, res, next)

    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
    assert.match(next.mock.calls[0].arguments[0].message, /Blocked illegal activity/)
  })

  void it('should call next with error if MemoryModel.findAll fails', async () => {
    mock.method(security.authenticatedUsers, 'get', () => ({ data: { id: 1, email: 'test@juice-sh.op', username: 'test' } }))
    const error = new Error('Memory error')
    mock.method(MemoryModel, 'findAll', async () => { throw error })

    await dataExport()(req, res, next)

    assert.equal(next.mock.calls.length, 1)
    assert.equal(next.mock.calls[0].arguments[0], error)
  })

  void it('should call next with error if ordersCollection.find fails', async () => {
    mock.method(security.authenticatedUsers, 'get', () => ({ data: { id: 1, email: 'test@juice-sh.op', username: 'test' } }))
    mock.method(MemoryModel, 'findAll', async () => [])
    const error = new Error('Orders error')
    mock.method(db.ordersCollection, 'find', async () => { throw error })

    await dataExport()(req, res, next)

    assert.equal(next.mock.calls.length, 1)
    assert.match(next.mock.calls[0].arguments[0].message, /Error retrieving orders/)
  })

  void it('should call next with error if reviewsCollection.find fails', async () => {
    mock.method(security.authenticatedUsers, 'get', () => ({ data: { id: 1, email: 'test@juice-sh.op', username: 'test' } }))
    mock.method(MemoryModel, 'findAll', async () => [])
    mock.method(db.ordersCollection, 'find', async () => [])
    const error = new Error('Reviews error')
    mock.method(db.reviewsCollection, 'find', async () => { throw error })

    await dataExport()(req, res, next)

    assert.equal(next.mock.calls.length, 1)
    assert.match(next.mock.calls[0].arguments[0].message, /Error retrieving reviews/)
  })
})
