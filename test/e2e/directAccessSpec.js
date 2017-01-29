'use strict'

describe('/', function () {
  describe('challenge "easterEgg2"', function () {
    it('should be able to access "secret" url for easter egg', function () {
      browser.driver.get(browser.baseUrl + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
    })

    protractor.expect.challengeSolved({challenge: 'Easter Egg Tier 2'})
  })

  describe('challenge "premiumPaywall"', function () {
    it('should be able to access "super secret" url for premium content', function () {
      browser.driver.get(browser.baseUrl + '/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
    })

    protractor.expect.challengeSolved({challenge: 'Premium Paywall'})
  })

  describe('challenge "geocitiesTheme"', function () {
    it('should be possible to change the CSS theme to geo-bootstrap', function () {
      browser.ignoreSynchronization = true
      browser.executeScript('document.getElementById("theme").setAttribute("href", "css/geo-bootstrap/swatch/bootstrap.css");')
      browser.driver.sleep(2000)

      browser.get('/#/search')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
    })

    protractor.expect.challengeSolved({challenge: 'Eye Candy'})
  })

  describe('challenge "extraLanguage"', function () {
    it('should be able to access the Klingon translation file', function () {
      browser.driver.get(browser.baseUrl + '/i18n/tlh.json')
    })

    protractor.expect.challengeSolved({challenge: 'Extra Language'})
  })
})
