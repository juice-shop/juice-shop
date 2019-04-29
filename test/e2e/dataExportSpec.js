const config = require('config')

describe('/#/privacy-security/data-export', () => {
  describe('challenge "dataExportChallenge"', () => {
    it('should be possible to register a user', () => {
      browser.get('/#/register')
      element(by.id('emailControl')).sendKeys('admun@' + config.get('application.domain'))
      element(by.id('passwordControl')).sendKeys('admun123')
      element(by.id('repeatPasswordControl')).sendKeys('admun123')
      element(by.name('securityQuestion')).click()
      element.all(by.cssContainingText('mat-option', 'Your eldest siblings middle name?')).click()
      element(by.id('securityAnswerControl')).sendKeys('admun')
      element(by.id('registerButton')).click()
    })

    it('should be possible to login with the registered user', () => {
      browser.get('/#/login')
      element(by.id('email')).sendKeys('admun@' + config.get('application.domain'))
      element(by.id('password')).sendKeys('admun123')
      element(by.id('loginButton')).click()
      browser.driver.sleep(1000)
    })

    it('should be possible to request data export', () => {
      browser.get('/#/privacy-security/data-export')
      element(by.id('formatControl')).all(by.tagName('mat-radio-button')).get(0).click()
      element(by.id('submitButton')).click()
    })
    protractor.expect.challengeSolved({ challenge: 'GDPR Compliance' })
  })
})
