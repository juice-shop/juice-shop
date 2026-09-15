/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { retrieveChallengesWithCodeSnippet } from '../../routes/vulnCodeSnippet'
import { readFixes } from '../../routes/vulnCodeFixes'
import fs from 'graceful-fs'

void describe('codingChallengeFixes', () => {
  let codingChallenges: string[]
  before(async () => {
    codingChallenges = await retrieveChallengesWithCodeSnippet()
  })

  void it('should have a correct fix for each coding challenge', async () => {
    for (const challenge of codingChallenges) {
      const fixes = readFixes(challenge)
      assert.ok(fixes.correct > -1, `Coding challenge ${challenge} does not have a correct fix file`)
    }
  })

  void it('should have a total of three or more fix options for each coding challenge', async () => {
    for (const challenge of codingChallenges) {
      const fixes = readFixes(challenge)
      assert.ok(fixes.fixes.length >= 3, `Coding challenge ${challenge} does not have enough fix option files`)
    }
  })

  void it('should have an info YAML file for each coding challenge', async () => {
    for (const challenge of codingChallenges) {
      assert.equal(fs.existsSync('./data/static/codefixes/' + challenge + '.info.yml'), true, `Coding challenge ${challenge} does not have an info YAML file`)
    }
  })
})
