/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
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

  beforeEach(() => {
    this.req = { query: {} }
    this.res = { redirect: sinon.spy(), status: sinon.spy() }
    this.next = sinon.spy()
    this.save = () => ({
      then () { }
    })
  })

  describe('should be performed for all allowlisted URLs', () => {
    for (const url of require('../../lib/insecurity').redirectAllowlist) {
      it(url, () => {
        this.req.query.to = url

        performRedirect()(this.req, this.res, this.next)

        expect(this.res.redirect).to.have.been.calledWith(url)
      })
    }
  })

  it('should raise error for URL not on allowlist', () => {
    this.req.query.to = 'http://kimminich.de'

    performRedirect()(this.req, this.res, this.next)

    expect(this.res.redirect).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('redirecting to https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm should solve the "redirectCryptoCurrencyChallenge"', () => {
    this.req.query.to = 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('redirecting to https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW should solve the "redirectCryptoCurrencyChallenge"', () => {
    this.req.query.to = 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('redirecting to https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 should solve the "redirectCryptoCurrencyChallenge"', () => {
    this.req.query.to = 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectCryptoCurrencyChallenge.solved).to.equal(true)
  })

  it('tricking the allowlist should solve "redirectChallenge"', () => {
    this.req.query.to = 'http://kimminich.de?to=https://github.com/bkimminich/juice-shop'
    challenges.redirectChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectChallenge.solved).to.equal(true)
  })
})
