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
})
