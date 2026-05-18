/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import fs from 'node:fs'
import { filterString, findChangedFiles, getFixExplanation, loadChallengeInfo, type CacheData, type ChallengeInfo } from '../../rsn/rsnUtil'

const expect = chai.expect

describe('rsnUtil', () => {
  describe('filterString', () => {
    it('should remove carriage return characters', () => {
      expect(filterString('line1\r\nline2\r\n')).to.equal('line1\nline2\n')
    })

    it('should leave unix line endings intact', () => {
      expect(filterString('line1\nline2\n')).to.equal('line1\nline2\n')
    })

    it('should handle empty string', () => {
      expect(filterString('')).to.equal('')
    })

    it('should handle string with only carriage returns', () => {
      expect(filterString('\r\r\r')).to.equal('')
    })
  })

  describe('findChangedFiles', () => {
    it('should return empty array when no changes', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal([])
    })

    it('should detect changed added lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 11], removed: [] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal(['challenge_1.ts'])
    })

    it('should detect changed removed lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [], removed: [7] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [], removed: [8] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal(['challenge_1.ts'])
    })

    it('should detect new files not in cache', () => {
      const current: CacheData = {
        'newChallenge_1.ts': { added: [], removed: [] }
      }
      const cached: CacheData = {}
      expect(findChangedFiles(current, cached)).to.deep.equal(['newChallenge_1.ts'])
    })

    it('should detect length changes in added lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 10, 15], removed: [] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal(['challenge_1.ts'])
    })

    it('should detect length changes in removed lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [], removed: [3, 7] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [], removed: [3] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal(['challenge_1.ts'])
    })

    it('should return multiple changed files', () => {
      const current: CacheData = {
        'a_1.ts': { added: [1], removed: [] },
        'b_1.ts': { added: [], removed: [2] },
        'c_1.ts': { added: [], removed: [] }
      }
      const cached: CacheData = {
        'a_1.ts': { added: [], removed: [] },
        'b_1.ts': { added: [], removed: [] },
        'c_1.ts': { added: [], removed: [] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal(['a_1.ts', 'b_1.ts'])
    })

    it('should compare correctly regardless of array order', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [10, 5], removed: [7, 3] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3, 7] }
      }
      expect(findChangedFiles(current, cached)).to.deep.equal([])
    })
  })

  describe('getFixExplanation', () => {
    const info: ChallengeInfo = {
      fixes: [
        { id: 1, explanation: 'First fix explanation' },
        { id: 2, explanation: 'Second fix explanation' },
        { id: 3, explanation: 'Third fix explanation' }
      ],
      hints: ['hint1']
    }

    it('should return explanation for standard filename', () => {
      expect(getFixExplanation('challengeName_2.ts', info)).to.equal('Second fix explanation')
    })

    it('should return explanation for correct fix filename', () => {
      expect(getFixExplanation('challengeName_1_correct.ts', info)).to.equal('First fix explanation')
    })

    it('should return null when fix id not found in info', () => {
      expect(getFixExplanation('challengeName_99.ts', info)).to.equal(null)
    })

    it('should return null when info is null', () => {
      expect(getFixExplanation('challengeName_1.ts', null)).to.equal(null)
    })

    it('should return null when filename has no id pattern', () => {
      expect(getFixExplanation('noIdHere.ts', info)).to.equal(null)
    })
  })

  describe('loadChallengeInfo', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should return null when info file does not exist', () => {
      sinon.stub(fs, 'existsSync').returns(false)
      expect(loadChallengeInfo('nonExistentChallenge')).to.equal(null)
    })

    it('should parse and return challenge info from yml file', () => {
      sinon.stub(fs, 'existsSync').returns(true)
      sinon.stub(fs, 'readFileSync').returns(
        'fixes:\n' +
        '  - id: 1\n' +
        '    explanation: "Test explanation"\n' +
        'hints:\n' +
        '  - "Test hint"\n'
      )
      const result = loadChallengeInfo('testChallenge')
      expect(result).to.deep.equal({
        fixes: [{ id: 1, explanation: 'Test explanation' }],
        hints: ['Test hint']
      })
    })
  })
})
