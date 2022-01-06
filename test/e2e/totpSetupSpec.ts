/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser, by, element, ElementFinder, protractor } from 'protractor'
import { basePath, beforeEachLogin } from './e2eHelpers'

const otplib = require('otplib')

const EC = protractor.ExpectedConditions

describe('/#/basket', () => {
  let successMessage: ElementFinder
  let setupInstructions: ElementFinder
  let currentPasswordSetup: ElementFinder
  let currentPasswordDisable: ElementFinder
  let initalToken: ElementFinder
  let setupSubmit: ElementFinder
  let disableSubmit: ElementFinder

  beforeEach(() => {
    successMessage = element(by.id('2fa-setup-successfully'))
    setupInstructions = element(by.id('2fa-setup-instructions'))
    currentPasswordSetup = element(by.id('currentPasswordSetup'))
    currentPasswordDisable = element(by.id('currentPasswordDisable'))
    initalToken = element(by.id('initalToken'))
    setupSubmit = element(by.id('setupTwoFactorAuth'))
    disableSubmit = element(by.id('disableTwoFactorAuth'))
  })

  describe('as wurstbrot', () => {
    beforeEachLogin({
      email: `wurstbrot@${config.get('application.domain')}`,
      password: 'EinBelegtesBrotMitSchinkenSCHINKEN!',
      totpSecret: 'IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH'
    })

    it('should show an success message for 2fa enabled accounts', () => {
      void browser.get(`${basePath}/#/privacy-security/two-factor-authentication`)

      void browser.wait(EC.visibilityOf(successMessage), 5000, '2FA success message didnt show up for an 2fa enabled account in time')
    })
  })

  describe('as amy', () => {
    beforeEachLogin({ email: `amy@${config.get('application.domain')}`, password: 'K1f.....................' })

    it('should be possible to setup 2fa for a account without 2fa enabled', async () => {
      void browser.get(`${basePath}/#/privacy-security/two-factor-authentication`)

      void browser.wait(EC.visibilityOf(setupInstructions), 5000, '2FA setup instructions should show up for users without 2fa enabled')

      const secret = await initalToken.getAttribute('data-test-totp-secret')

      void currentPasswordSetup.sendKeys('K1f.....................')
      void initalToken.sendKeys(otplib.authenticator.generate(secret))
      void setupSubmit.click()

      void browser.wait(EC.visibilityOf(successMessage), 5000, 'success message didnt show up in time after enabling 2fa for an account')

      void currentPasswordDisable.sendKeys('K1f.....................')
      void disableSubmit.click()

      void browser.wait(EC.visibilityOf(setupInstructions), 5000, '2FA setup instructions should show up after users disabled their accounts')
    })
  })
})
