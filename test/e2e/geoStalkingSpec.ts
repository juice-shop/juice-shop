/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { $, browser, by, element, ElementFinder, protractor } from 'protractor'

describe('/#/photo-wall', () => {
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

  describe('challenge "geoStalkingMeta"', () => {
    it('Should be possible to find the answer to a security question in the meta-data of a photo on the photo wall', () => {
      const answer = ((() => {
        const memories: any = config.get('memories')
        for (let i = 0; i < memories.length; i++) {
          if (memories[i].geoStalkingMetaSecurityAnswer) {
            return memories[i].geoStalkingMetaSecurityAnswer
          }
        }
      })())

      void email.sendKeys(`john@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys(answer)
      void newPassword.sendKeys('123456')
      void newPasswordRepeat.sendKeys('123456')
      void resetButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Meta Geo Stalking' })
  })

  describe('challenge "geoStalkingVisual"', () => {
    it('Should be possible to determine the answer to a security question by looking closely at an image on the photo wall', () => {
      const answer = ((() => {
        const memories: any = config.get('memories')
        for (let i = 0; i < memories.length; i++) {
          if (memories[i].geoStalkingVisualSecurityAnswer) {
            return memories[i].geoStalkingVisualSecurityAnswer
          }
        }
      })())

      void email.sendKeys(`emma@${config.get('application.domain')}`)
      void browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      void securityAnswer.sendKeys(answer)
      void newPassword.sendKeys('123456')
      void newPasswordRepeat.sendKeys('123456')
      void resetButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Visual Geo Stalking' })
  })
})
