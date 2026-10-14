/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { filterString, findChangedFiles, getFixExplanation, loadChallengeInfo, type CacheData, type ChallengeInfo } from '../../rsn/rsnUtil'

void describe('rsnUtil', () => {
  void describe('filterString', () => {
    void it('should remove carriage return characters', () => {
      assert.equal(filterString('line1\r\nline2\r\n'), 'line1\nline2\n')
    })

    void it('should leave unix line endings intact', () => {
      assert.equal(filterString('line1\nline2\n'), 'line1\nline2\n')
    })

    void it('should handle empty string', () => {
      assert.equal(filterString(''), '')
    })

    void it('should handle string with only carriage returns', () => {
      assert.equal(filterString('\r\r\r'), '')
    })
  })

  void describe('findChangedFiles', () => {
    void it('should return empty array when no changes', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3] }
      }
      assert.deepEqual(findChangedFiles(current, cached), [])
    })

    void it('should detect changed added lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 11], removed: [] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [] }
      }
      assert.deepEqual(findChangedFiles(current, cached), ['challenge_1.ts'])
    })

    void it('should detect changed removed lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [], removed: [7] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [], removed: [8] }
      }
      assert.deepEqual(findChangedFiles(current, cached), ['challenge_1.ts'])
    })

    void it('should detect new files not in cache', () => {
      const current: CacheData = {
        'newChallenge_1.ts': { added: [], removed: [] }
      }
      const cached: CacheData = {}
      assert.deepEqual(findChangedFiles(current, cached), ['newChallenge_1.ts'])
    })

    void it('should detect length changes in added lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [5, 10, 15], removed: [] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [] }
      }
      assert.deepEqual(findChangedFiles(current, cached), ['challenge_1.ts'])
    })

    void it('should detect length changes in removed lines', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [], removed: [3, 7] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [], removed: [3] }
      }
      assert.deepEqual(findChangedFiles(current, cached), ['challenge_1.ts'])
    })

    void it('should return multiple changed files', () => {
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
      assert.deepEqual(findChangedFiles(current, cached), ['a_1.ts', 'b_1.ts'])
    })

    void it('should compare correctly regardless of array order', () => {
      const current: CacheData = {
        'challenge_1.ts': { added: [10, 5], removed: [7, 3] }
      }
      const cached: CacheData = {
        'challenge_1.ts': { added: [5, 10], removed: [3, 7] }
      }
      assert.deepEqual(findChangedFiles(current, cached), [])
    })
  })

  void describe('getFixExplanation', () => {
    const info: ChallengeInfo = {
      fixes: [
        { id: 1, explanation: 'First fix explanation' },
        { id: 2, explanation: 'Second fix explanation' },
        { id: 3, explanation: 'Third fix explanation' }
      ],
      hints: ['hint1']
    }

    void it('should return explanation for standard filename', () => {
      assert.equal(getFixExplanation('challengeName_2.ts', info), 'Second fix explanation')
    })

    void it('should return explanation for correct fix filename', () => {
      assert.equal(getFixExplanation('challengeName_1_correct.ts', info), 'First fix explanation')
    })

    void it('should return null when fix id not found in info', () => {
      assert.equal(getFixExplanation('challengeName_99.ts', info), null)
    })

    void it('should return null when info is null', () => {
      assert.equal(getFixExplanation('challengeName_1.ts', null), null)
    })

    void it('should return null when filename has no id pattern', () => {
      assert.equal(getFixExplanation('noIdHere.ts', info), null)
    })
  })

  void describe('loadChallengeInfo', () => {
    afterEach(() => {
      mock.restoreAll()
    })

    void it('should return null when info file does not exist', () => {
      mock.method(fs, 'existsSync', () => false)
      assert.equal(loadChallengeInfo('nonExistentChallenge'), null)
    })

    void it('should parse and return challenge info from yml file', () => {
      mock.method(fs, 'existsSync', () => true)
      mock.method(fs, 'readFileSync', () =>
        'fixes:\n' +
        '  - id: 1\n' +
        '    explanation: "Test explanation"\n' +
        'hints:\n' +
        '  - "Test hint"\n'
      )
      const result = loadChallengeInfo('testChallenge')
      assert.deepEqual(result, {
        fixes: [{ id: 1, explanation: 'Test explanation' }],
        hints: ['Test hint']
      })
    })
  })
})
