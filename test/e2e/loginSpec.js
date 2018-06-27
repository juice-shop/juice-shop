/* const config = require('config')

describe('/#/login', () => {
  let email, password, rememberMeCheckbox, loginButton

  beforeEach(() => {
    browser.get('/#/login')
    email = element(by.model('user.email'))
    password = element(by.model('user.password'))
    rememberMeCheckbox = element(by.model('rememberMe'))
    loginButton = element(by.id('loginButton'))
  })

  describe('challenge "loginAdmin"', () => {
    xit('should log in Admin with SQLI attack on email field using "\' or 1=1--"', () => {
      email.sendKeys('\' or 1=1--')
      password.sendKeys('a')
      loginButton.click()
    })

    xit('should log in Admin with SQLI attack on email field using "admin@<juice-sh.op>\'--"', () => {
      email.sendKeys('admin@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Admin'})
  })

  describe('challenge "loginJim"', () => {
    xit('should log in Jim with SQLI attack on email field using "jim@<juice-sh.op>\'--"', () => {
      email.sendKeys('jim@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Jim'})
  })

  describe('challenge "loginBender"', () => {
    xit('should log in Bender with SQLI attack on email field using "bender@<juice-sh.op>\'--"', () => {
      email.sendKeys('bender@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Bender'})
  })

  describe('challenge "adminCredentials"', () => {
    xit('should be able to log in with original (weak) admin credentials', () => {
      email.sendKeys('admin@' + config.get('application.domain'))
      password.sendKeys('admin123')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Password Strength'})
  })

  describe('challenge "loginSupport"', () => {
    xit('should be able to log in with original support-team credentials', () => {
      email.sendKeys('support@' + config.get('application.domain'))
      password.sendKeys('J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Support Team'})
  })

  describe('challenge "loginRapper"', () => {
    xit('should be able to log in with original MC SafeSearch credentials', () => {
      email.sendKeys('mc.safesearch@' + config.get('application.domain'))
      password.sendKeys('Mr. N00dles')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login MC SafeSearch'})
  })

  describe('challenge "oauthUserPassword"', () => {
    xit('should be able to log in as bjoern.kimminich@googlemail.com with base64-encoded email as password', () => {
      email.sendKeys('bjoern.kimminich@googlemail.com')
      password.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Bjoern'})
  })

  describe('challenge "loginCiso"', () => {
    xit('should be able to log in as ciso@juice-sh.op by using "Remember me" in combination with (fake) OAuth login with another user', () => {
      email.sendKeys('ciso@' + config.get('application.domain'))
      password.sendKeys('wrong')
      rememberMeCheckbox.click()
      loginButton.click()

      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.post(\'/rest/user/login\', {email: \'admin@juice-sh.op\', password: \'admin123\', oauth: true});')

      // Deselect to clear email field for subsequent tests
      rememberMeCheckbox.click()
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login CISO'})
  })
}) */
