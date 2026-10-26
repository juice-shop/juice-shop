/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { contractExploitListener } from '../../routes/web3Wallet'

void describe('web3Wallet', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = { body: { walletAddress: '0x1234567890123456789012345678901234567890' } }
    res = {
      status: mock.fn(() => res),
      json: mock.fn()
    }
  })

  void it('creates event listener on first call and returns 200', async () => {
    await contractExploitListener()(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 200)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { success: true, message: 'Event Listener Created' })
  })

  void it('returns 200 when event listener is already created', async () => {
    req.body.walletAddress = '0x0987654321098765432109876543210987654321'
    await contractExploitListener()(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 200)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { success: true, message: 'Event Listener Created' })
  })

  void it('returns 500 when an unexpected error occurs', async () => {
    const errorRes: any = {
      status: mock.fn(() => errorRes),
      json: mock.fn()
    }
    // Make json throw on the first call to trigger the catch block
    errorRes.json.mock.mockImplementationOnce(() => {
      throw new Error('Test error')
    })
    await contractExploitListener()(req, errorRes)

    assert.equal(errorRes.status.mock.calls.length, 2)
    assert.equal(errorRes.status.mock.calls[1].arguments[0], 500)
  })
})
