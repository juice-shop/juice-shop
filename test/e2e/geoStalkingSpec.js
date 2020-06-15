/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

describe('/#/geo', () => {
  let email, securityAnswer, newPassword, newPasswordRepeat, resetButton

  const EC = protractor.ExpectedConditions

  beforeEach(() => {
    $('#logout').isPresent().then((result) => {
      if (result) {
        $('#logout').click()
      }
    })
    browser.wait(EC.stalenessOf($('#logout')), 5000)
    browser.get(protractor.basePath + '/#/forgot-password')
    email = element(by.id('email'))
    securityAnswer = element(by.id('securityAnswer'))
    newPassword = element(by.id('newPassword'))
    newPasswordRepeat = element(by.id('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  })

  describe('challenge geoStalkingEasy', () => {
    it('Should be possible to find the answer to a security question in the meta-data of a photo on the photo wall', () => {
      const answer = config.get('challenges.geoStalking.securityAnswerEasy')

      email.sendKeys('john@juice.shop')
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys(answer)
      newPassword.sendKeys('123456')
      newPasswordRepeat.sendKeys('123456')
      resetButton.click()

      protractor.expect.challengeSolved({ challenge: 'Geo Stalking - Easy' })
    })
  })

  describe('challenge geoStalkingHard', () => {
    it('Should be possible to determine the answer to a security question by looking closely at an image on the photo wall', () => {
      const answer = config.get('challenges.geoStalking.securityAnswerHard')

      email.sendKeys('emma@juice.shop')
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys(answer)
      newPassword.sendKeys('123456')
      newPasswordRepeat.sendKeys('123456')
      resetButton.click()

      protractor.expect.challengeSolved({ challenge: 'Geo Stalking - Hard' })
    })
  })
})
