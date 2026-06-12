import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { type Challenge } from '../../data/types'

void describe('antiCheat', () => {
  let antiCheat: any
  beforeEach(() => {
    delete require.cache[require.resolve('../../lib/antiCheat')]
    antiCheat = require('../../lib/antiCheat')
    antiCheat.reset()
  })

  void describe('calculateCheatScore', () => {
    void it('should return cheat score of 0 if challenge is tightly coupled to the previously solved one', () => {
      const challenge1: Challenge = { key: 'loginAdminChallenge', difficulty: 1 } as any
      const challenge2: Challenge = { key: 'weakPasswordChallenge', difficulty: 1 } as any

      antiCheat.calculateCheatScore(challenge1)
      const score = antiCheat.calculateCheatScore(challenge2)

      assert.equal(score, 0)
    })

    void it('should return cheat score of 0 if challenge is loosely coupled to the previously solved one', () => {
      const challenge1: Challenge = { key: 'localXssChallenge', difficulty: 1 } as any
      const challenge2: Challenge = { key: 'xssBonusChallenge', difficulty: 1 } as any

      antiCheat.calculateCheatScore(challenge1)
      const score = antiCheat.calculateCheatScore(challenge2)

      assert.equal(score, 0)
    })

    void it('should return cheat score of 0 if challenge is loosely coupled to one in the past', () => {
      const challenge1: Challenge = { key: 'localXssChallenge', difficulty: 1 } as any
      const challenge2: Challenge = { key: 'missingEncodingChallenge', difficulty: 1 } as any
      const challenge3: Challenge = { key: 'forgottenBackupChallenge', difficulty: 1 } as any
      const challenge4: Challenge = { key: 'xssBonusChallenge', difficulty: 1 } as any

      antiCheat.calculateCheatScore(challenge1)
      antiCheat.calculateCheatScore(challenge2)
      antiCheat.calculateCheatScore(challenge3)
      const score = antiCheat.calculateCheatScore(challenge4)

      assert.equal(score, 0)
    })

    void it('should assume cheating if two unrelated challenges are solved after each other', () => {
      const challenge1: Challenge = { key: 'localXssChallenge', difficulty: 1 } as any
      const challenge2: Challenge = { key: 'missingEncodingChallenge', difficulty: 1 } as any

      antiCheat.calculateCheatScore(challenge1)
      const score = antiCheat.calculateCheatScore(challenge2)

      assert.ok(score > 0)
    })
  })

  void describe('totalCheatScore', () => {
    void it('should return 0 if no challenges are solved', () => {
      assert.equal(antiCheat.totalCheatScore(), 0)
    })

    void it('should return the median cheat score of all solves', () => {
      const challenge1: Challenge = { key: 'loginAdminChallenge', difficulty: 1 } as any
      const challenge2: Challenge = { key: 'weakPasswordChallenge', difficulty: 1 } as any
      const challenge3: Challenge = { key: 'missingEncodingChallenge', difficulty: 1 } as any

      antiCheat.calculateCheatScore(challenge1) // score 0 (first solve after seed)
      antiCheat.calculateCheatScore(challenge2) // score 0 (tightly coupled)
      antiCheat.calculateCheatScore(challenge3) // score > 0 (unrelated)

      const totalScore = antiCheat.totalCheatScore()
      assert.ok(totalScore >= 0 && totalScore <= 1)
    })
  })

  void describe('checkForPreSolveInteractions', () => {
    void it('should mark interaction as true if URL matches a fragment', async () => {
      const challenge: Challenge = { key: 'directoryListingChallenge', difficulty: 1 } as any

      const scoreWithoutInteraction = antiCheat.calculateCheatScore(challenge)
      assert.strictEqual(scoreWithoutInteraction, 1, 'Score without interaction should be 1.0 (maximum)')

      antiCheat.reset()

      const req: any = { url: '/ftp' }
      const res: any = {}
      const next = () => {}
      antiCheat.checkForPreSolveInteractions()(req, res, next)

      await new Promise(resolve => setTimeout(resolve, 100))
      const scoreWithInteraction = antiCheat.calculateCheatScore(challenge)

      assert.ok(scoreWithInteraction < scoreWithoutInteraction, `Score with interaction (${scoreWithInteraction}) should be lower than without (${scoreWithoutInteraction})`)
    })
  })

  void describe('reset', () => {
    void it('should reset solves and interactions', () => {
      const challenge: Challenge = { key: 'directoryListingChallenge', difficulty: 1 } as any
      antiCheat.checkForPreSolveInteractions()({ url: '/ftp' } as any, {}, () => {})

      antiCheat.calculateCheatScore(challenge)
      assert.ok(antiCheat.totalCheatScore() > 0, 'Total cheat score should be > 0 after a solve')

      antiCheat.reset()
      assert.strictEqual(antiCheat.totalCheatScore(), 0, 'Total cheat score should be 0 after reset')

      const scoreAfterReset = antiCheat.calculateCheatScore(challenge)
      assert.strictEqual(scoreAfterReset, 1, 'Score after reset should be 1.0 again because interactions were reset')
    })
  })
})
