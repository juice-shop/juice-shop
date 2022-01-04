/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser, protractor } from 'protractor'

describe('/#/privacy-security/privacy-policy', () => {
  describe('challenge "privacyPolicy"', () => {
    it('should be possible to access privacy policy', () => {
      void browser.get(`${protractor.basePath}/#/privacy-security/privacy-policy`)
      expect(browser.getCurrentUrl()).toMatch(/\/privacy-policy/)
    })

    protractor.expect.challengeSolved({ challenge: 'Privacy Policy' })
  })
})
