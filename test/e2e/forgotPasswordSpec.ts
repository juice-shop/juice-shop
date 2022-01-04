/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $, browser, by, element, ElementFinder, protractor } from 'protractor'

describe('/#/forgot-password', () => {
  let email: ElementFinder, securityAnswer: ElementFinder, newPassword: ElementFinder, newPasswordRepeat: ElementFinder, resetButton: ElementFinder

  const EC = protractor.ExpectedConditions

  beforeEach(() => {
    void $('#logout').isPresent().then((result) => {
      if (result) {
        void $('#logout').click()
      }
    })
    void browser.wait(EC.stalenessOf($('#logout')), 5000)
    void browser.get(`${protractor.basePath}/#/forgot-password`)
    email = element(by.id('email'))
    securityAnswer = element(by.id('securityAnswer'))
    newPassword = element(by.id('newPassword'))
    newPasswordRepeat = element(by.id('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  })

  describe('as Jim', () => {
    it('should be able to reset password with his security answer', () => {
      void email.sendKeys(`jim@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys('Samuel')
      void newPassword.sendKeys('I <3 Spock')
      void newPasswordRepeat.sendKeys('I <3 Spock')
      void resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Jim\'s Password' })
  })

  describe('as Bender', () => {
    it('should be able to reset password with his security answer', () => {
      void email.sendKeys(`bender@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys('Stop\'n\'Drop')
      void newPassword.sendKeys('Brannigan 8=o Leela')
      void newPasswordRepeat.sendKeys('Brannigan 8=o Leela')
      void resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Bender\'s Password' })
  })

  describe('as Bjoern', () => {
    describe('for his internal account', () => {
      it('should be able to reset password with his security answer', () => {
        void email.sendKeys(`bjoern@${config.get('application.domain')}`)
        void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
        void securityAnswer.sendKeys('West-2082')
        void newPassword.sendKeys('monkey birthday ')
        void newPasswordRepeat.sendKeys('monkey birthday ')
        void resetButton.click()

        expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
      })

      protractor.expect.challengeSolved({ challenge: 'Reset Bjoern\'s Password' })
    })

    describe('for his OWASP account', () => {
      it('should be able to reset password with his security answer', () => {
        void email.sendKeys('bjoern@owasp.org')
        void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
        void securityAnswer.sendKeys('Zaya')
        void newPassword.sendKeys('kitten lesser pooch')
        void newPasswordRepeat.sendKeys('kitten lesser pooch')
        void resetButton.click()

        expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
      })

      protractor.expect.challengeSolved({ challenge: 'Bjoern\'s Favorite Pet' })
    })
  })

  describe('as Morty', () => {
    it('should be able to reset password with his security answer', () => {
      void email.sendKeys(`morty@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys('5N0wb41L')
      void newPassword.sendKeys('iBurri3dMySe1f!')
      void newPasswordRepeat.sendKeys('iBurri3dMySe1f!')
      void resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Morty\'s Password' })
  })

  describe('as Uvogin', () => {
    it('should be able to reset password with his security answer', () => {
      void email.sendKeys(`uvogin@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys('Silence of the Lambs')
      void newPassword.sendKeys('ora-ora > muda-muda')
      void newPasswordRepeat.sendKeys('ora-ora > muda-muda')
      void resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Uvogin\'s Password' })
  })
})
