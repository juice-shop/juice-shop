/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import Hashids from 'hashids/cjs'
import { challenges } from '../../data/datacache'
import { ChallengeModel } from '../../models/challenge'
import { type Challenge } from '@juice-shop/data/types'
import { restoreProgress, restoreProgressFindIt } from '../../routes/restoreProgress'

void describe('restoreProgress', () => {
  let req: any
  let res: any
  let save: any

  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  beforeEach(() => {
    req = { params: {} }
    res = {}
    res.status = mock.fn(() => res)
    res.send = mock.fn()
    res.json = mock.fn()
    res.end = mock.fn()
    save = () => ({
      then () { }
    })
  })

  void it('should restore solved challenges from a valid continue code', () => {
    challenges.scoreBoardChallenge = { id: 1, solved: false, save } as unknown as Challenge
    challenges.adminSectionChallenge = { id: 2, solved: false, save } as unknown as Challenge
    const hashids = new Hashids('this is my salt', 60, alphabet)
    req.params.continueCode = hashids.encode([1, 2])

    restoreProgress()(req, res)

    assert.equal(challenges.scoreBoardChallenge.solved, true)
    assert.equal(challenges.adminSectionChallenge.solved, true)
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { data: '2 solved challenges have been restored.' })
  })

  void it('should solve "continueCodeChallenge" for a code containing only the magic id', () => {
    challenges.continueCodeChallenge = { id: 3, solved: false, save } as unknown as Challenge
    const hashids = new Hashids('this is my salt', 60, alphabet)
    req.params.continueCode = hashids.encode([999])

    restoreProgress()(req, res)

    assert.equal(challenges.continueCodeChallenge.solved, true)
    assert.equal(res.end.mock.calls.length, 1)
  })

  void it('should return 404 for a code with invalid characters', () => {
    req.params.continueCode = '!!!not-a-valid-code!!!'

    restoreProgress()(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 404)
    assert.equal(res.send.mock.calls.length, 1)
    assert.equal(res.send.mock.calls[0].arguments[0], 'Invalid continue code.')
  })

  void it('should return 404 for a well-formed code that decodes to no ids', () => {
    req.params.continueCode = 'abc'

    restoreProgress()(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 404)
    assert.equal(res.send.mock.calls.length, 1)
    assert.equal(res.send.mock.calls[0].arguments[0], 'Invalid continue code.')
  })

  void it('should restore "Find It" progress from a valid continue code', async (t) => {
    challenges.restfulXssChallenge = { id: 11, key: 'restfulXssChallenge', name: 'API-only XSS', save } as unknown as Challenge
    const update = t.mock.method(ChallengeModel, 'update', async () => [1])
    const hashids = new Hashids('this is the salt for findIt challenges', 60, alphabet)
    req.params.continueCode = hashids.encode([11])

    await restoreProgressFindIt()(req, res)

    assert.equal(update.mock.calls.length, 1)
    assert.equal(res.json.mock.calls.length, 1)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { data: '1 solved challenges have been restored.' })
  })

  void it('should return 404 for a "Find It" code with invalid characters', async () => {
    req.params.continueCode = '!!!not-a-valid-code!!!'

    await restoreProgressFindIt()(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 404)
    assert.equal(res.send.mock.calls.length, 1)
    assert.equal(res.send.mock.calls[0].arguments[0], 'Invalid continue code.')
  })
})
