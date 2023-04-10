/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('redirect', () => {
  const performRedirect = require('../../routes/redirect')
  const challenges = require('../../data/datacache').challenges
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = { query: {} }
    res = { redirect: sinon.spy(), status: sinon.spy() }
    next = sinon.spy()
    save = () => ({
      then () { }
    })
  })

  describe('should be performed for all allowlisted URLs', () => {
    for (const url of require('../../lib/insecurity').redirectAllowlist) {
      it(url, () => {
        req.query.to = url

        performRedirect()(req, res, next)

        expect(res.redirect).to.have.been.calledWith(url)
      })
    }
  })

  it('should raise error for URL not on allowlist', () => {
    req.query.to = 'http://kimminich.de'

    performRedirect()(req, res, next)

    expect(res.redirect).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('redirecting to https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: save }

    performRedirect()(req, res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('redirecting to https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: save }

    performRedirect()(req, res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('redirecting to https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: save }

    performRedirect()(req, res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('tricking the allowlist should solve "redirectChallenge"', () => {
    req.query.to = 'http://kimminich.de?to=https://github.com/bkimminich/juice-shop'
    challenges.redirectChallenge = { solved: false, save: save }

    performRedirect()(req, res)

    expect(challenges.redirectChallenge.solved).to.equal(true)
  })
})
