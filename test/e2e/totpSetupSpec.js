/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const otplib = require('otplib')
const config = require('config')

const EC = protractor.ExpectedConditions

describe('/#/basket', () => {
  let successMessage
  let setupInstructions
  let currentPasswordSetup
  let currentPasswordDisable
  let initalToken
  let setupSubmit
  let disableSubmit

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
    protractor.beforeEach.login({
      email: 'wurstbrot@' + config.get('application.domain'),
      password: 'EinBelegtesBrotMitSchinkenSCHINKEN!',
      totpSecret: 'IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH'
    })

    it('should show an success message for 2fa enabled accounts', () => {
      browser.get(protractor.basePath + '/#/privacy-security/two-factor-authentication')

      browser.wait(EC.visibilityOf(successMessage), 5000, '2FA success message didnt show up for an 2fa enabled account in time')
    })
  })

  describe('as amy', () => {
    protractor.beforeEach.login({ email: 'amy@' + config.get('application.domain'), password: 'K1f.....................' })

    it('should be possible to setup 2fa for a account without 2fa enabled', async () => {
      browser.get(protractor.basePath + '/#/privacy-security/two-factor-authentication')

      browser.wait(EC.visibilityOf(setupInstructions), 5000, '2FA setup instructions should show up for users without 2fa enabled')

      const secret = await initalToken.getAttribute('data-test-totp-secret')

      currentPasswordSetup.sendKeys('K1f.....................')
      initalToken.sendKeys(otplib.authenticator.generate(secret))
      setupSubmit.click()

      browser.wait(EC.visibilityOf(successMessage), 5000, 'success message didnt show up in time after enabling 2fa for an account')

      currentPasswordDisable.sendKeys('K1f.....................')
      disableSubmit.click()

      browser.wait(EC.visibilityOf(setupInstructions), 5000, '2FA setup instructions should show up after users disabled their accounts')
    })
  })
})
