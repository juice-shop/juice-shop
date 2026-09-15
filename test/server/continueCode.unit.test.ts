/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { continueCode } from '../../routes/continueCode'

void describe('continueCode', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = { json: mock.fn() }
  })

  void it('should be empty when no challenges are solved', () => {
    challenges.scoreBoardChallenge = { solved: false } as unknown as Challenge
    challenges.adminSectionChallenge = { solved: false } as unknown as Challenge

    continueCode()(req, res)
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { continueCode: undefined })
  })

  void it('should be hashid value of IDs of solved challenges', () => {
    challenges.scoreBoardChallenge = { id: 1, solved: true } as unknown as Challenge
    challenges.adminSectionChallenge = { id: 2, solved: true } as unknown as Challenge
    challenges.continueCodeChallenge = { id: 3, solved: false } as unknown as Challenge

    continueCode()(req, res)
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { continueCode: 'yXjv6Z5jWJnzD6a3YvmwPRXK7roAyzHDde2Og19yEN84plqxkMBbLVQrDeoY' })
  })
})
