/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import otplib = require('otplib')
import { browser, by, element, protractor } from 'protractor'

const url = require('url')

let _basePath = (new url.URL(browser.baseUrl)).pathname
if (_basePath === '/') _basePath = ''
export const basePath = _basePath

export function expectChallengeSolved (context: any) {
  describe('(utils)', () => {
    beforeEach(() => {
      void browser.get(`${basePath}/#/score-board`)
    })

    it(`challenge '${context.challenge}' should be solved on score board`, () => {
      expect(element(by.id(`${context.challenge}.solved`)).isPresent()).toBeTruthy()
      expect(element(by.id(`${context.challenge}.notSolved`)).isPresent()).toBeFalsy()
    })
  })
}

export function beforeEachLogin (context: any) {
  describe('(utils)', () => {
    beforeEach(() => {
      void browser.get(`${basePath}/#/login`)

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
