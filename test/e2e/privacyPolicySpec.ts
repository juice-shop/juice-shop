/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser } from 'protractor'
import { basePath, expectChallengeSolved } from './e2eHelpers'

describe('/#/privacy-security/privacy-policy', () => {
  describe('challenge "privacyPolicy"', () => {
    it('should be possible to access privacy policy', () => {
      void browser.get(`${basePath}/#/privacy-security/privacy-policy`)
      expect(browser.getCurrentUrl()).toMatch(/\/privacy-policy/)
    })

    expectChallengeSolved({ challenge: 'Privacy Policy' })
  })
})
