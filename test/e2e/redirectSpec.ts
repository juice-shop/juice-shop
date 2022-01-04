/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser, protractor } from 'protractor'

describe('/redirect', () => {
  describe('challenge "redirect"', () => {
    it('should show error page when supplying an unrecognized target URL', () => {
      void browser.driver.get(`${browser.baseUrl}/redirect?to=http://kimminich.de`).then(() => {
        expect(browser.driver.getPageSource()).toContain('Unrecognized target URL for redirect: http://kimminich.de')
      })
    })
  })

  describe('challenge "redirect"', () => {
    it('should redirect to target URL if allowlisted URL is contained in it as parameter', () => {
      void browser.driver.get(`${browser.baseUrl}/redirect?to=https://owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop`).then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/owasp\.org/)
      })
    })

    protractor.expect.challengeSolved({ challenge: 'Allowlist Bypass' })
  })

  describe('challenge "redirectCryptoCurrency"', () => {
    it('should still redirect to forgotten entry https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 on allowlist', () => {
      void browser.driver.get(`${browser.baseUrl}/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6`)
    })

    protractor.expect.challengeSolved({ challenge: 'Outdated Allowlist' })
  })
})
