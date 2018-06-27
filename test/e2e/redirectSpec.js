// describe('/redirect', () => {
//   describe('challenge "redirect"', () => {
//     xit('should show error page when supplying an unrecognized target URL', () => {
//       browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de').then(() => {
//         expect(browser.driver.getPageSource()).toContain('Unrecognized target URL for redirect: http://kimminich.de')
//       })
//     })
//   })

//   describe('challenge "redirect"', () => {
//     xit('should redirect to target URL if whitelisted URL is contained in xit as parameter', () => {
//       browser.driver.get(browser.baseUrl + '/redirect?to=https://www.owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop').then(() => {
//         expect(browser.driver.getCurrentUrl()).toMatch(/https:\/\/www\.owasp\.org/)
//       })
//     })

//     protractor.expect.challengeSolved({challenge: 'Redirects Tier 2'})
//   })

//   describe('challenge "redirectGratipay"', () => {
//     xit('should still redirect to forgotten entry https://gratipay.com/juice-shop on whitelist', () => {
//       browser.driver.get(browser.baseUrl + '/redirect?to=https://gratipay.com/juice-shop')
//     })

//     protractor.expect.challengeSolved({challenge: 'Redirects Tier 1'})
//   })
// })
