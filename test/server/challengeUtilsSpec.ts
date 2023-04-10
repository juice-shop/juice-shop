/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const expect = chai.expect

describe('challengeUtils', () => {
  const challengeUtils = require('../../lib/challengeUtils')
  const challenges = require('../../data/datacache').challenges

  describe('findChallengeByName', () => {
    it('returns undefined for non-existing challenge', () => {
      challenges.scoreBoardChallenge = { name: 'scoreBoardChallenge' }
      expect(challengeUtils.findChallengeByName('blubbChallenge')).to.equal(undefined)
    })

    it('returns existing challenge', () => {
      challenges.scoreBoardChallenge = { name: 'scoreBoardChallenge' }
      expect(challengeUtils.findChallengeByName('scoreBoardChallenge')).to.deep.equal({ name: 'scoreBoardChallenge' })
    })
  })

  describe('findChallengeById', () => {
    it('returns undefined for non-existing challenge', () => {
      challenges.scoreBoardChallenge = { id: 42 }
      expect(challengeUtils.findChallengeById(43)).to.equal(undefined)
    })

    it('returns existing challenge', () => {
      challenges.scoreBoardChallenge = { id: 42 }
      expect(challengeUtils.findChallengeById(42)).to.deep.equal({ id: 42 })
    })
  })
})
