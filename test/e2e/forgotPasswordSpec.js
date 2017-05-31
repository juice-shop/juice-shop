'use strict'

var config = require('config')

describe('/#/forgot-password', function () {
  var email, securityAnswer, newPassword, newPasswordRepeat, resetButton

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
      securityAnswer.sendKeys('West-2082')
      newPassword.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      newPasswordRepeat.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      resetButton.click()

      expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide')
    })

    protractor.expect.challengeSolved({challenge: 'Reset Bjoern\'s Password'})
  })
})
