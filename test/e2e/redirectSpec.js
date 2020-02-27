describe('/redirect', () => {
  describe('challenge "redirect"', () => {
    it('should show error page when supplying an unrecognized target URL', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de').then(() => {
        expect(browser.driver.getPageSource()).toContain('Unrecognized target URL for redirect: http://kimminich.de')
      })
    })
  })

  describe('challenge "redirect"', () => {
    it('should redirect to target URL if whitelisted URL is contained in it as parameter', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop').then(() => {
        expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/owasp\.org/)
      })
    })

    protractor.expect.challengeSolved({ challenge: 'Whitelist Bypass' })
  })

  describe('challenge "redirectCryptoCurrency"', () => {
    it('should still redirect to forgotten entry https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 on whitelist', () => {
      browser.driver.get(browser.baseUrl + '/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6')
    })

    protractor.expect.challengeSolved({ challenge: 'Outdated Whitelist' })
  })
})
