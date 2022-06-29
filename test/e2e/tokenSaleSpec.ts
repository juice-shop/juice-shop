/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser } from 'protractor'
import { basePath, expectChallengeSolved } from './e2eHelpers'

describe('/#/tokensale-ico-ea', () => {
  describe('challenge "tokenSale"', () => {
    it('should be possible to access token sale section even when not authenticated', () => {
      void browser.get(`${basePath}/#/tokensale-ico-ea`)
      expect(browser.getCurrentUrl()).toMatch(/\/tokensale-ico-ea/)
    })

    expectChallengeSolved({ challenge: 'Blockchain Hype' })
  })
})
