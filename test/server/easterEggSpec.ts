/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('easterEgg', () => {
  const serveEasterEgg = require('../../routes/easterEgg')
  const challenges = require('../../data/datacache').challenges
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    res = { sendFile: sinon.spy() }
    req = {}
    save = () => ({
      then () { }
    })
  })

  it('should serve /frontend/dist/frontend/assets/private/threejs-demo.html', () => {
    serveEasterEgg()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]threejs-demo\.html/))
  })

  it('should solve "easterEggLevelTwoChallenge"', () => {
    challenges.easterEggLevelTwoChallenge = { solved: false, save }

    serveEasterEgg()(req, res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
