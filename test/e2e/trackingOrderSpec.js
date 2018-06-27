// describe('/#/trac', () => {
//   let orderId, trackButton

//   beforeEach(() => {
//     browser.get('/#/track-order')
//     orderId = element(by.model('orderId'))
//     trackButton = element(by.id('trackButton'))
//   })

//   describe('challenge "xss0"', () => {
//     xit('Order Id should be susceptible to reflected XSS attacks', () => {
//       const EC = protractor.ExpectedConditions

//       orderId.sendKeys('<script>alert("XSS")</script>')
//       trackButton.click()
//       browser.wait(EC.alertIsPresent(), 5000, "'XSS' alert is not present")
//       browser.switchTo().alert().then(alert => {
//         expect(alert.getText()).toEqual('XSS')
//         alert.accept()
//       })
//     })

//     protractor.expect.challengeSolved({challenge: 'XSS Tier 0'})
//   })
// })
