'use strict'

describe('/redirect', function () {
  describe('challenge "redirect"', function () {
    it('should show error page when supplying an unrecognized target URL', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de').then(function () {
        expect(browser.driver.getPageSource()).toContain('Unrecognized target URL for redirect: http://kimminich.de')
      })
    })
  })

  describe('challenge "redirect"', function () {
    it('should redirect to target URL if https://github.com/bkimminich/juice-shop is contained in it as parameter', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop').then(function () {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN is contained in it as parameter', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN').then(function () {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://gratipay.com/juice-shop is contained in it as parameter', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://gratipay.com/juice-shop').then(function () {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub is contained in it as parameter', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub').then(function () {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=US&item_name=Juice%20Shop&no_note=0&currency_code=USD&bn=PP%2dDonationsBF is contained in it as encoded parameter', function () {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https%3A%2F%2Fwww.paypal.com%2Fcgi-bin%2Fwebscr%3Fcmd%3D_donations%26business%3Dpaypal%2540owasp%252eorg%26lc%3DUS%26item_name%3DJuice%2520Shop%26no_note%3D0%26currency_code%3DUSD%26bn%3DPP%252dDonationsBF').then(function () {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    protractor.expect.challengeSolved({challenge: 'redirect'})
  })
})
