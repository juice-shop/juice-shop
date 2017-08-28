'use strict'

describe('/redirect', () => {
  describe('challenge "redirect"', () => {
    it('should show error page when supplying an unrecognized target URL', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de').then(() => {
        expect(browser.driver.getPageSource()).toContain('Unrecognized target URL for redirect: http://kimminich.de')
      })
    })
  })

  describe('challenge "redirect"', () => {
    it('should redirect to target URL if https://github.com/bkimminich/juice-shop is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://gratipay.com/juice-shop is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://gratipay.com/juice-shop').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    it('should redirect to target URL if https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
      })
    })

    protractor.expect.challengeSolved({challenge: 'Redirects'})
  })
})
