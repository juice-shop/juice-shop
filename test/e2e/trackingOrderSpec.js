describe('/#/track-order', () => {
  let orderId, trackButton

  beforeEach(() => {
    browser.get('/#/track-order')
    orderId = element(by.id('orderId'))
    trackButton = element(by.id('trackButton'))
  })

  describe('challenge "xss0"', () => {
    it('Order Id should be susceptible to reflected XSS attacks', () => {
      const EC = protractor.ExpectedConditions

      orderId.sendKeys('<iframe src="javascript:alert(`xss`)">')
      trackButton.click()
      browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present")
      browser.switchTo().alert().then(alert => {
        expect(alert.getText()).toEqual('xss')
        alert.accept()
      })
    })

    protractor.expect.challengeSolved({ challenge: 'XSS Tier 0' })
  })
})
