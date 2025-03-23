/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { challenges } from '../../data/datacache'
import { type Challenge } from 'data/types'
import { serveEasterEgg } from '../../routes/easterEgg'
const expect = chai.expect
chai.use(sinonChai)

describe('easterEgg', () => {
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
    challenges.easterEggLevelTwoChallenge = { solved: false, save } as unknown as Challenge

    serveEasterEgg()(req, res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
