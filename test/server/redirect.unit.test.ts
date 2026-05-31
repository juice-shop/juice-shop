/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { performRedirect } from '../../routes/redirect'
import { type Challenge } from '@juice-shop/data/types'
import { redirectAllowlist } from '../../lib/insecurity'

void describe('redirect', () => {
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = { query: {} }
    res = { redirect: mock.fn(), status: mock.fn() }
    next = mock.fn()
    save = () => ({
      then () { }
    })
  })

  void describe('should be performed for all allowlisted URLs', () => {
    for (const url of redirectAllowlist) {
      void it(url, () => {
        req.query.to = url

        performRedirect()(req, res, next)

        assert.equal(res.redirect.mock.calls.length, 1)
        assert.equal(res.redirect.mock.calls[0].arguments[0], url)
      })
    }
  })

  void it('should raise error for URL not on allowlist', () => {
    req.query.to = 'http://kimminich.de'

    performRedirect()(req, res, next)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(next.mock.calls.length, 1)
    assert.ok(next.mock.calls[0].arguments[0] instanceof Error)
  })

  void it('redirecting to https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save } as unknown as Challenge

    performRedirect()(req, res, next)

    assert.equal(challenges.redirectCryptoCurrencyChallenge.solved, true)
  })

  void it('redirecting to https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save } as unknown as Challenge

    performRedirect()(req, res, next)

    assert.equal(challenges.redirectCryptoCurrencyChallenge.solved, true)
  })

  void it('redirecting to https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 should solve the "redirectCryptoCurrencyChallenge"', () => {
    req.query.to = 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
    challenges.redirectCryptoCurrencyChallenge = { solved: false, save } as unknown as Challenge

    performRedirect()(req, res, next)

    assert.equal(challenges.redirectCryptoCurrencyChallenge.solved, true)
  })

  void it('tricking the allowlist should solve "redirectChallenge"', () => {
    req.query.to = 'http://kimminich.de?to=https://github.com/juice-shop/juice-shop'
    challenges.redirectChallenge = { solved: false, save } as unknown as Challenge

    performRedirect()(req, res, next)

    assert.equal(challenges.redirectChallenge.solved, true)
  })
})
