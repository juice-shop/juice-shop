/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'

const antiCheat = require('../../lib/antiCheat')
const accuracy = require('../../lib/accuracy')
const { ChallengeModel } = require('../../models/challenge')
const { HintModel } = require('../../models/hint')
const datacache = require('../../data/datacache')
const config = require('config')
const logger = require('../../lib/logger').default

const challengeUtils = require('../../lib/challengeUtils')

void describe('challengeUtils', () => {
  beforeEach(() => {
    datacache.challenges.scoreBoardChallenge = { id: 42, name: 'scoreBoardChallenge', key: 'scoreBoardChallenge', difficulty: 1 } as any
    datacache.notifications.length = 0
    ;(global as any).io = { emit: mock.fn() }
    antiCheat.reset()
    accuracy.reset()
    HintModel.count = mock.fn(async () => 0)
    ChallengeModel.update = mock.fn(async () => [1])
  })

  void describe('findChallengeByName', () => {
    void it('returns undefined for non-existing challenge', () => {
      assert.equal(challengeUtils.findChallengeByName('blubbChallenge'), undefined)
    })

    void it('returns existing challenge', () => {
      assert.equal(challengeUtils.findChallengeByName('scoreBoardChallenge'), datacache.challenges.scoreBoardChallenge)
    })
  })

  void describe('findChallengeById', () => {
    void it('returns undefined for non-existing challenge', () => {
      assert.equal(challengeUtils.findChallengeById(43), undefined)
    })

    void it('returns existing challenge', () => {
      assert.equal(challengeUtils.findChallengeById(42), datacache.challenges.scoreBoardChallenge)
    })
  })

  void describe('notSolved', () => {
    void it('returns true for unsolved challenge', () => {
      assert.equal(challengeUtils.notSolved({ solved: false } as any), true)
    })

    void it('returns false for solved challenge', () => {
      assert.equal(challengeUtils.notSolved({ solved: true } as any), false)
    })

    void it('returns falsy for null challenge', () => {
      assert.equal(challengeUtils.notSolved(null as any), null)
    })
  })

  void describe('solve', () => {
    void it('should mark challenge as solved and save it', async () => {
      const challenge = {
        solved: false,
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        difficulty: 1,
        id: 1,
        save: mock.fn(async function (this: any) { return this })
      } as any

      const originalHintCount = HintModel.count
      HintModel.count = mock.fn(async () => 0)

      try {
        await challengeUtils.solve(challenge)

        assert.equal(challenge.solved, true)
        assert.equal(challenge.save.mock.calls.length, 1)
        assert.equal(datacache.notifications.length, 1)
        assert.equal(datacache.notifications[0].key, 'scoreBoardChallenge')
      } finally {
        HintModel.count = originalHintCount
      }
    })

    void it('should not calculate cheat score if it is a restore', async () => {
      const challenge = {
        solved: false,
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        difficulty: 1,
        save: mock.fn(async function (this: any) { return this })
      } as any

      await challengeUtils.solve(challenge, true)

      assert.equal(antiCheat.totalCheatScore(), 0)
    })

    void it('should log error if webhook notification fails', async () => {
      const challenge = {
        solved: false,
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        difficulty: 1,
        id: 1,
        save: mock.fn(async function (this: any) { return this })
      } as any

      process.env.SOLUTIONS_WEBHOOK = 'http://webhook.test'
      const originalFetch = global.fetch
      ;(global as any).fetch = mock.fn(async () => { throw new Error('Fetch error') })
      const originalLoggerError = logger.error
      logger.error = mock.fn()

      try {
        await challengeUtils.solve(challenge)
        // Wait for unhandled promise in solve (webhook notification is not awaited)
        await new Promise(resolve => setTimeout(resolve, 10))
        assert.equal(logger.error.mock.calls.length, 1)
        assert.match(logger.error.mock.calls[0].arguments[0], /Webhook notification failed/)
      } finally {
        delete process.env.SOLUTIONS_WEBHOOK
        ;(global as any).fetch = originalFetch
        logger.error = originalLoggerError
      }
    })
  })

  void describe('solveIf', () => {
    void it('should solve challenge if criteria is met and not yet solved', async () => {
      const challenge = {
        solved: false,
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        difficulty: 1,
        save: mock.fn(async function (this: any) { return this })
      } as any
      const criteria = () => true

      await challengeUtils.solveIf(challenge, criteria)

      assert.equal(challenge.solved, true)
    })
  })

  void describe('sendCodingChallengeNotification', () => {
    void it('should emit "code challenge solved" event via socket.io', () => {
      const challenge = { key: 'test', codingChallengeStatus: 1 as const }
      challengeUtils.sendCodingChallengeNotification(challenge)

      const io = (global as any).io
      assert.equal(io.emit.mock.calls.length, 1)
      assert.equal(io.emit.mock.calls[0].arguments[0], 'code challenge solved')
    })
  })

  void describe('solveFindIt', () => {
    void it('should update status and calculate accuracy/cheat score', async () => {
      const challengeKey = 'scoreBoardChallenge'
      const originalUpdate = ChallengeModel.update
      ChallengeModel.update = mock.fn(async () => [1])

      try {
        await challengeUtils.solveFindIt(challengeKey)

        assert.equal(ChallengeModel.update.mock.calls.length, 1)
        assert.equal(accuracy.getFindItAttempts(challengeKey), 1)

        const io = (global as any).io
        assert.equal(io.emit.mock.calls.length, 1)
      } finally {
        ChallengeModel.update = originalUpdate
      }
    })

    void it('should not calculate accuracy/cheat score if it is a restore', async () => {
      const challengeKey = 'scoreBoardChallenge'
      const originalUpdate = ChallengeModel.update
      ChallengeModel.update = mock.fn(async () => [1])

      await challengeUtils.solveFindIt(challengeKey, true)

      assert.equal(accuracy.getFindItAttempts(challengeKey), 0)
      ChallengeModel.update = originalUpdate
    })
  })

  void describe('solveFixIt', () => {
    void it('should update status and calculate accuracy/cheat score', async () => {
      const challengeKey = 'scoreBoardChallenge'
      const originalUpdate = ChallengeModel.update
      ChallengeModel.update = mock.fn(async () => [1])

      try {
        await challengeUtils.solveFixIt(challengeKey)

        assert.equal(ChallengeModel.update.mock.calls.length, 1)

        const io = (global as any).io
        assert.equal(io.emit.mock.calls.length, 1)
      } finally {
        ChallengeModel.update = originalUpdate
      }
    })

    void it('should not calculate accuracy/cheat score if it is a restore', async () => {
      const challengeKey = 'scoreBoardChallenge'
      const originalUpdate = ChallengeModel.update
      ChallengeModel.update = mock.fn(async () => [1])

      await challengeUtils.solveFixIt(challengeKey, true)

      assert.equal(ChallengeModel.update.mock.calls.length, 1)
      ChallengeModel.update = originalUpdate
    })
  })

  void describe('sendNotification', () => {
    void it('should push notification to datacache and emit via socket.io', (t) => {
      const challenge = {
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        description: 'Find the score board',
        solved: true
      } as any

      t.mock.method(config, 'get', (key: string) => {
        if (key === 'challenges.showSolvedNotifications') return true
        if (key === 'challenges.codingChallengesEnabled') return 'always'
        return false
      })

      challengeUtils.sendNotification(challenge, false)

      assert.equal(datacache.notifications.length, 1)
      assert.equal(datacache.notifications[0].key, 'scoreBoardChallenge')

      const io = (global as any).io
      assert.equal(io.emit.mock.calls.length, 1)
      assert.equal(io.emit.mock.calls[0].arguments[0], 'challenge solved')
    })

    void it('should handle missing fullChallenge', (t) => {
      const challenge = {
        key: 'nonExisting',
        name: 'Non Existing',
        description: 'desc',
        solved: true
      } as any

      challengeUtils.sendNotification(challenge, false)

      assert.equal(datacache.notifications.length, 1)
      assert.equal(datacache.notifications[0].key, 'nonExisting')
    })

    void it('should respect showSolvedNotifications config', (t) => {
      const challenge = {
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        description: 'desc',
        solved: true
      } as any

      t.mock.method(config, 'get', (key: string) => {
        if (key === 'challenges.showSolvedNotifications') return false
        return true
      })

      challengeUtils.sendNotification(challenge, false)
      assert.equal(datacache.notifications[0].hidden, true)
    })

    void it('should handle codingChallengesEnabled set to "never"', (t) => {
      const challenge = {
        key: 'scoreBoardChallenge',
        name: 'Score Board',
        description: 'desc',
        solved: true
      } as any
      datacache.challenges.scoreBoardChallenge.hasCodingChallenge = true

      t.mock.method(config, 'get', (key: string) => {
        if (key === 'challenges.codingChallengesEnabled') return 'never'
        return true
      })

      challengeUtils.sendNotification(challenge, false)
      assert.equal(datacache.notifications[0].codingChallenge, false)
    })
  })
})
