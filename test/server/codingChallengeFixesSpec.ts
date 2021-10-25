/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { retrieveChallengesWithCodeSnippet } from '../../routes/vulnCodeSnippet'
import { readFixes } from '../../routes/vulnCodeFixes'
import chai = require('chai')
import fs from 'graceful-fs'
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('codingChallengeFixes', () => {
  let codingChallenges: string[]
  before(async () => {
    codingChallenges = await retrieveChallengesWithCodeSnippet()
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

  xit('should have an info YAML file for each coding challenge', async () => { // TODO Enable test once all coding challenges have an info file. Then also state it as a mandatory pieced in companion guide.
    for (const challenge of codingChallenges) {
      expect(fs.existsSync('./data/static/codefixes/' + challenge + '.info.yml'), `Coding challenge ${challenge} does not have an info YAML file`).to.equal(true)
    }
  })
})
