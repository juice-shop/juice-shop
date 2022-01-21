/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('premiumReward', () => {
  const servePremiumContent = require('../../routes/premiumReward')
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

  it('should serve /frontend/dist/frontend/assets/private/JuiceShop_Wallpaper_1920x1080_VR.jpg', () => {
    servePremiumContent()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]JuiceShop_Wallpaper_1920x1080_VR\.jpg/))
  })

  it('should solve "premiumPaywallChallenge"', () => {
    challenges.premiumPaywallChallenge = { solved: false, save: save }

    servePremiumContent()(req, res)

    expect(challenges.premiumPaywallChallenge.solved).to.equal(true)
  })
})
