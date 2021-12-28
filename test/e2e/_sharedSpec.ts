/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import otplib = require('otplib')
import { by, element, browser, protractor } from 'protractor'

const url = require('url')

let basePath = (new url.URL(browser.baseUrl)).pathname
if (basePath === '/') basePath = ''
protractor.basePath = basePath

protractor.expect = {
  challengeSolved: function (context: any) {
    describe('(shared)', () => {
      beforeEach(() => {
        void browser.get(`${protractor.basePath}/#/score-board`)
      })

      it(`challenge '${context.challenge}' should be solved on score board`, () => {
        expect(element(by.id(`${context.challenge}.solved`)).isPresent()).toBeTruthy()
        expect(element(by.id(`${context.challenge}.notSolved`)).isPresent()).toBeFalsy()
      })
    })
  }
}

protractor.beforeEach = {
  login: function (context: any) {
    describe('(shared)', () => {
      beforeEach(() => {
        void browser.get(`${protractor.basePath}/#/login`)

        void element(by.id('email')).sendKeys(context.email)
        void element(by.id('password')).sendKeys(context.password)
        void element(by.id('loginButton')).click()

        if (context.totpSecret) {
          const EC = protractor.ExpectedConditions
          const twoFactorTokenInput = element(by.id('totpToken'))
          const twoFactorSubmitButton = element(by.id('totpSubmitButton'))

          void browser.wait(EC.visibilityOf(twoFactorTokenInput), 1000, '2FA token field did not become visible')

          const totpToken = otplib.authenticator.generate(context.totpSecret)
          void twoFactorTokenInput.sendKeys(totpToken)

          void twoFactorSubmitButton.click()
        }
      })

      it(`should have logged in user "${context.email}" with password "${context.password}"`, () => {
        expect(browser.getCurrentUrl()).toMatch(/\/search/)
      })
    })
  }
}
