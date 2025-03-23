/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { type Challenge } from 'data/types'
import { challenges } from '../../data/datacache'
import { servePremiumContent } from '../../routes/premiumReward'

const expect = chai.expect
chai.use(sinonChai)

describe('premiumReward', () => {
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
    challenges.premiumPaywallChallenge = { solved: false, save } as unknown as Challenge

    servePremiumContent()(req, res)

    expect(challenges.premiumPaywallChallenge.solved).to.equal(true)
  })
})
