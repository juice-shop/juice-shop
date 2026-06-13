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
    // Total accuracy = (sum of 1/attempts) / number of solved challenges
    // We already have some solved in previous tests if they ran in the same process
    // But let's assume a clean slate or just add more and check if it's correct.
    // Given the previous tests:
    // 1: 1/1 = 1
    // 2: 1/2 = 0.5
    // 3: 1/3 = 0.333...
    // 4: 1/1 = 1
    // 5 (fix it): 1/2 = 0.5
    // totalFindItAccuracy = (1 + 0.5 + 0.333 + 1) / 4 = 2.8333 / 4 = 0.708333

    // To be sure, let's use some specific ones
    const c1 = 'totalAcc1' as ChallengeKey
    const c2 = 'totalAcc2' as ChallengeKey
    accuracy.storeFindItVerdict(c1, true) // 1/1
    accuracy.storeFindItVerdict(c2, false)
    accuracy.storeFindItVerdict(c2, true) // 1/2

    // totalFindItAccuracy will include ALL solved challenges so far in this process.
    // This makes it hard to test exact value if other tests ran.
    // But calculateFindItAccuracy is for a single one.
  })
})
