/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { saveLoginIp } from '../../routes/saveLoginIp'
import { UserModel } from '../../models/user'
import * as security from '../../lib/insecurity'

void describe('saveLoginIp', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } }
    res = { json: mock.fn(), sendStatus: mock.fn() }
    next = mock.fn()
  })

  void it('should return 401 if user is not authenticated', async () => {
    mock.method(security.authenticatedUsers, 'from', () => undefined)

    await saveLoginIp()(req, res, next)

    assert.equal(res.sendStatus.mock.calls.length, 1)
    assert.equal(res.sendStatus.mock.calls[0].arguments[0], 401)
  })

  void it('should use the first element if true-client-ip header is an array', async () => {
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { id: 1 } }))
    req.headers['true-client-ip'] = ['1.1.1.1', '2.2.2.2']
    const findByPkMock = mock.method(UserModel, 'findByPk', async () => ({
      update: mock.fn(async (data: any) => data)
    }))

    await saveLoginIp()(req, res, next)

    assert.equal(findByPkMock.mock.calls.length, 1)
    const updateCall = findByPkMock.mock.calls[0].result as any
    const updateMock = (await updateCall).update
    assert.equal(updateMock.mock.calls[0].arguments[0].lastLoginIp, '1.1.1.1')
  })

  void it('should call next with error if update fails', async () => {
    mock.method(security.authenticatedUsers, 'from', () => ({ data: { id: 1 } }))
    const error = new Error('Update failed')
    mock.method(UserModel, 'findByPk', async () => ({
      update: mock.fn(async () => { throw error })
    }))

    await saveLoginIp()(req, res, next)

    assert.equal(next.mock.calls.length, 1)
    assert.equal(next.mock.calls[0].arguments[0], error)
  })
})
