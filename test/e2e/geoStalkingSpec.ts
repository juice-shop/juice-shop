/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

describe('/#/photo-wall', () => {
  let email, securityAnswer, newPassword, newPasswordRepeat, resetButton

  const EC = protractor.ExpectedConditions

  beforeEach(() => {
    $('#logout').isPresent().then((result) => {
      if (result) {
        $('#logout').click()
      }
    })
    browser.wait(EC.stalenessOf($('#logout')), 5000)
    browser.get(`${protractor.basePath}/#/forgot-password`)
    email = element(by.id('email'))
    securityAnswer = element(by.id('securityAnswer'))
    newPassword = element(by.id('newPassword'))
    newPasswordRepeat = element(by.id('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  })

  describe('challenge "geoStalkingMeta"', () => {
    it('Should be possible to find the answer to a security question in the meta-data of a photo on the photo wall', () => {
      const answer = ((() => {
        const memories = config.get('memories')
        for (let i = 0; i < memories.length; i++) {
          if (memories[i].geoStalkingMetaSecurityAnswer) {
            return memories[i].geoStalkingMetaSecurityAnswer
          }
        }
      })())

      email.sendKeys(`john@${config.get('application.domain')}`)
      browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      securityAnswer.sendKeys(answer)
      newPassword.sendKeys('123456')
      newPasswordRepeat.sendKeys('123456')
      resetButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Meta Geo Stalking' })
  })

  describe('challenge "geoStalkingVisual"', () => {
    it('Should be possible to determine the answer to a security question by looking closely at an image on the photo wall', () => {
      const answer = ((() => {
        const memories = config.get('memories')
        for (let i = 0; i < memories.length; i++) {
          if (memories[i].geoStalkingVisualSecurityAnswer) {
            return memories[i].geoStalkingVisualSecurityAnswer
          }
        }
      })())

      email.sendKeys(`emma@${config.get('application.domain')}`)
      browser.wait(EC.elementToBeClickable(securityAnswer), 2000, 'Security answer field did not become visible')
      securityAnswer.sendKeys(answer)
      newPassword.sendKeys('123456')
      newPasswordRepeat.sendKeys('123456')
      resetButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Visual Geo Stalking' })
  })
})
