/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as accuracy from '../../lib/accuracy'
import { type ChallengeKey } from '@juice-shop/models/challenge'

void describe('accuracy', () => {
  void it('should calculate accuracy as 1.0 when solved on first attempt', () => {
    const challengeKey = 'testChallenge1' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 1.0)
    assert.equal(accuracy.getFindItAttempts(challengeKey), 1)
  })

  void it('should calculate accuracy as 0.5 when solved on second attempt', () => {
    const challengeKey = 'testChallenge2' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 0.5)
    assert.equal(accuracy.getFindItAttempts(challengeKey), 2)
  })

  void it('should calculate accuracy as 0.3333333333333333 when solved on third attempt', () => {
    const challengeKey = 'testChallenge3' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 1 / 3)
    assert.equal(accuracy.getFindItAttempts(challengeKey), 3)
  })

  void it('should not increase attempts after challenge is solved', () => {
    const challengeKey = 'testChallenge4' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, true)
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 1.0)
    assert.equal(accuracy.getFindItAttempts(challengeKey), 1)
  })

  void it('should calculate fix it accuracy independently', () => {
    const challengeKey = 'testChallenge5' as ChallengeKey
    accuracy.storeFixItVerdict(challengeKey, false)
    accuracy.storeFixItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFixItAccuracy(challengeKey), 0.5)
  })

  void it('should return 0 attempts for unknown challenge', () => {
    assert.equal(accuracy.getFindItAttempts('unknown' as ChallengeKey), 0)
  })

  void it('should return 0 accuracy for unsolved challenge', () => {
    const challengeKey = 'testChallengeUnsolved' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, false)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 0)
  })

  void it('should calculate total accuracy for multiple solved challenges', () => {
    accuracy.reset()
    const c1 = 'totalAcc1' as ChallengeKey
    const c2 = 'totalAcc2' as ChallengeKey
    accuracy.storeFindItVerdict(c1, true) // 1/1 = 1.0
    accuracy.storeFindItVerdict(c2, false)
    accuracy.storeFindItVerdict(c2, true) // 1/2 = 0.5
    assert.equal(accuracy.totalFindItAccuracy(), 0.75) // (1.0 + 0.5) / 2 = 0.75

    accuracy.storeFixItVerdict(c1, false)
    accuracy.storeFixItVerdict(c1, false)
    accuracy.storeFixItVerdict(c1, true) // 1/3 = 0.333...
    assert.equal(accuracy.totalFixItAccuracy(), 1 / 3)
  })

  void it('should return NaN for total accuracy when no challenges are solved', () => {
    accuracy.reset()
    assert.ok(isNaN(accuracy.totalFindItAccuracy()))
    assert.ok(isNaN(accuracy.totalFixItAccuracy()))
  })

  void it('should calculate accuracy as 0.2 for solved on fifth attempt', () => {
    const challengeKey = 'testChallenge5Attempts' as ChallengeKey
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, false)
    accuracy.storeFindItVerdict(challengeKey, true)
    assert.equal(accuracy.calculateFindItAccuracy(challengeKey), 0.2)
  })
})
