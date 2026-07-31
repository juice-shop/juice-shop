/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as codingChallenges from '../../lib/codingChallenges'

void describe('codingChallenges', () => {
  void it('should find files with code challenges in the project structure', async () => {
    const matches = await codingChallenges.findFilesWithCodeChallenges(['./lib'])
    assert.ok(matches.length > 0)
    assert.ok(matches.some(m => m.path.includes('insecurity.ts')))
  })

  void it('should log warning and continue if a path does not exist', async () => {
    const matches = await codingChallenges.findFilesWithCodeChallenges(['non-existent-folder'])
    assert.equal(matches.length, 0)
  })

  void it('should successfully retrieve coding challenges map', async () => {
    const challenges = await codingChallenges.getCodeChallenges()
    assert.ok(challenges instanceof Map)
    assert.ok(challenges.size > 0)
  })

  void it('BrokenBoundary error should have correct properties', () => {
    const error = new codingChallenges.BrokenBoundary('Test message')
    assert.equal(error.name, 'BrokenBoundary')
    assert.equal(error.message, 'Test message')
  })

  void it('should throw BrokenBoundary error if snippet boundaries are broken', () => {
    const source = '// vuln-code-snippet start challengeKey\n some code\n' // Missing end
    assert.throws(() => {
      codingChallenges.getCodingChallengeFromFileContent(source, 'challengeKey')
    }, {
      name: 'BrokenBoundary',
      message: 'Broken code snippet boundaries for: challengeKey'
    })
  })
})
