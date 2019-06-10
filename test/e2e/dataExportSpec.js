const config = require('config')

describe('/#/privacy-security/data-export', () => {
  beforeEach(() => {
    browser.get('/#/register')
    element(by.id('emailControl')).sendKeys('admun@' + config.get('application.domain'))
    element(by.id('passwordControl')).sendKeys('admun123')
    element(by.id('repeatPasswordControl')).sendKeys('admun123')
    element(by.name('securityQuestion')).click()
    element.all(by.cssContainingText('mat-option', 'Your eldest siblings middle name?')).click()
    element(by.id('securityAnswerControl')).sendKeys('admun')
    element(by.id('registerButton')).click()
  })

  describe('challenge "dataExportChallenge"', () => {

    protractor.beforeEach.login({ email: 'admun@' + config.get('application.domain'), password: 'admun123' })

    it('should be possible to steal admin user data by causing email clash during export', () => {
      let exportFormats = by.tagName('mat-radio-button')

      browser.get('/#/privacy-security/data-export')
      browser.wait(EC.visibilityOf(exportFormats), 1000, 'Export format radio buttons are not visible')
      element(by.id('formatControl')).all(exportFormats).get(0).click()
      element(by.id('submitButton')).click()
    })

    protractor.expect.challengeSolved({ challenge: 'GDPR Compliance Tier 2' })
  })
})
