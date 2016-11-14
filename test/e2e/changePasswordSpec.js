'use strict'

describe('/#/change-password', function () {
  var currentPassword, newPassword, newPasswordRepeat, changeButton

  describe('as bender', function () {
    protractor.beforeEach.login({email: 'bender@juice-sh.op', password: 'OhG0dPlease1nsertLiquor!'})

    beforeEach(function () {
      browser.get('/#/change-password')
      currentPassword = element(by.model('currentPassword'))
      newPassword = element(by.model('newPassword'))
      newPasswordRepeat = element(by.model('newPasswordRepeat'))
      changeButton = element(by.id('changeButton'))
    })

    it('should be able to change password', function () {
      currentPassword.sendKeys('OhG0dPlease1nsertLiquor!')
      newPassword.sendKeys('genderBender')
      newPasswordRepeat.sendKeys('genderBender')
      changeButton.click()

      expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide')
    })
  })

  describe('challenge "csrf"', function () {
    protractor.beforeEach.login({email: 'bender@juice-sh.op', password: 'genderBender'})

    it('should be able to change password via GET witout passing current password', function () {
      browser.driver.get(browser.baseUrl + '/rest/user/change-password?new=slurmCl4ssic&repeat=slurmCl4ssic')

      browser.get('/#/login')
      element(by.model('user.email')).sendKeys('bender@juice-sh.op')
      element(by.model('user.password')).sendKeys('slurmCl4ssic')
      element(by.id('loginButton')).click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'csrf'})
  })
})
