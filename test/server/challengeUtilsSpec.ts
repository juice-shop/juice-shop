/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import * as challengeUtils from '../../lib/challengeUtils'
import { challenges } from '../../data/datacache'
import { type Challenge } from 'data/types'

const expect = chai.expect

describe('challengeUtils', () => {
  beforeEach(() => {
    challenges.scoreBoardChallenge = { id: 42, name: 'scoreBoardChallenge' } as unknown as Challenge
  })

  describe('findChallengeByName', () => {
    it('returns undefined for non-existing challenge', () => {
      expect(challengeUtils.findChallengeByName('blubbChallenge')).to.equal(undefined)
    })

    it('returns existing challenge', () => {
      expect(challengeUtils.findChallengeByName('scoreBoardChallenge')).to.deep.equal({ id: 42, name: 'scoreBoardChallenge' })
    })
  })

  describe('findChallengeById', () => {
    it('returns undefined for non-existing challenge', () => {
      expect(challengeUtils.findChallengeById(43)).to.equal(undefined)
    })

    it('returns existing challenge', () => {
      expect(challengeUtils.findChallengeById(42)).to.deep.equal({ id: 42, name: 'scoreBoardChallenge' })
    })
  })
})
