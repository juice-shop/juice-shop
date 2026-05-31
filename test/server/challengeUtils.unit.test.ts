/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import * as challengeUtils from '../../lib/challengeUtils'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'

void describe('challengeUtils', () => {
  beforeEach(() => {
    challenges.scoreBoardChallenge = { id: 42, name: 'scoreBoardChallenge' } as unknown as Challenge
  })

  void describe('findChallengeByName', () => {
    void it('returns undefined for non-existing challenge', () => {
      assert.equal(challengeUtils.findChallengeByName('blubbChallenge'), undefined)
    })

    void it('returns existing challenge', () => {
      assert.deepEqual(challengeUtils.findChallengeByName('scoreBoardChallenge'), { id: 42, name: 'scoreBoardChallenge' })
    })
  })

  void describe('findChallengeById', () => {
    void it('returns undefined for non-existing challenge', () => {
      assert.equal(challengeUtils.findChallengeById(43), undefined)
    })

    void it('returns existing challenge', () => {
      assert.deepEqual(challengeUtils.findChallengeById(42), { id: 42, name: 'scoreBoardChallenge' })
    })
  })
})
