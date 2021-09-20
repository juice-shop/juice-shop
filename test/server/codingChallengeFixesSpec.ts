/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { fileSniff, SNIPPET_PATHS } from '../../routes/vulnCodeSnippet'
import { readFixes } from '../../routes/vulnCodeFixes'
import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('codingChallengeFixes', () => {
  let codingChallenges: string[]
  before(async () => {
    const match = /vuln-code-snippet start .*/
    const matches = await fileSniff(SNIPPET_PATHS, match)
    codingChallenges = matches.map(m => m.match.trim().substr(26).trim()).join(' ').split(' ').filter(c => c.endsWith('Challenge'))
  })

  it('should have a correct fix for each coding challenge', async () => {
    for (const challenge of codingChallenges) {
      const fixes = readFixes(challenge)
      expect(fixes.correct, `Coding challenge ${challenge} does not have a correct fix file`).to.be.greaterThan(-1)
    }
  })

  it('should have a total of three or more fix options for each coding challenge', async () => {
    for (const challenge of codingChallenges) {
      const fixes = readFixes(challenge)
      expect(fixes.fixes.length, `Coding challenge ${challenge} does not have enough fix option files`).to.be.greaterThanOrEqual(3)
    }
  })
})
