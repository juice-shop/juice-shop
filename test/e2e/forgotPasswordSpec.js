'use strict'

const config = require('config')

describe('/#/forgot-password', function () {
  let email, securityAnswer, newPassword, newPasswordRepeat, resetButton

  const EC = protractor.ExpectedConditions

  beforeEach(function () {
    browser.get('/#/logout')
    browser.get('/#/forgot-password')
    email = element(by.model('email'))
    securityAnswer = element(by.model('securityAnswer'))
    newPassword = element(by.model('newPassword'))
    newPasswordRepeat = element(by.model('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  })

  describe('as Jim', function () {
    it('should be able to reset password with his security answer', function () {
      email.sendKeys('jim@' + config.get('application.domain'))
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('Samuel')
      newPassword.sendKeys('I <3 Spock')
      newPasswordRepeat.sendKeys('I <3 Spock')
      resetButton.click()

      expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide')
    })

    protractor.expect.challengeSolved({challenge: 'Reset Jim\'s Password'})
  })

  describe('as Bender', function () {
    it('should be able to reset password with his security answer', function () {
      email.sendKeys('bender@' + config.get('application.domain'))
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('Stop\'n\'Drop')
      newPassword.sendKeys('Brannigan 8=o Leela')
      newPasswordRepeat.sendKeys('Brannigan 8=o Leela')
      resetButton.click()

      expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide')
    })

    protractor.expect.challengeSolved({challenge: 'Reset Bender\'s Password'})
  })

  describe('as Bjoern', function () {
    it('should be able to reset password with his security answer', function () {
      email.sendKeys('bjoern.kimminich@googlemail.com')
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('West-2082')
      newPassword.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      newPasswordRepeat.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      resetButton.click()

      expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide')
    })

    protractor.expect.challengeSolved({challenge: 'Reset Bjoern\'s Password'})
  })
})
