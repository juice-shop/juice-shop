const config = require('config')

describe('/#/forgot-password', () => {
  let email, securityAnswer, newPassword, newPasswordRepeat, resetButton

  const EC = protractor.ExpectedConditions

  beforeEach(() => {
    $('#logout').isPresent().then((result) => {
      if (result) {
        $('#logout').click()
      }
    })
    browser.wait(EC.stalenessOf($('#logout')), 5000)
    browser.get('/#/forgot-password')
    email = element(by.id('email'))
    securityAnswer = element(by.id('securityAnswer'))
    newPassword = element(by.id('newPassword'))
    newPasswordRepeat = element(by.id('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  })

  describe('as Jim', () => {
    it('should be able to reset password with his security answer', () => {
      email.sendKeys('jim@' + config.get('application.domain'))
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('Samuel')
      newPassword.sendKeys('I <3 Spock')
      newPasswordRepeat.sendKeys('I <3 Spock')
      resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Jim\'s Password' })
  })

  describe('as Bender', () => {
    it('should be able to reset password with his security answer', () => {
      email.sendKeys('bender@' + config.get('application.domain'))
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('Stop\'n\'Drop')
      newPassword.sendKeys('Brannigan 8=o Leela')
      newPasswordRepeat.sendKeys('Brannigan 8=o Leela')
      resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Bender\'s Password' })
  })

  describe('as Bjoern', () => {
    describe('for his internal account', () => {
      it('should be able to reset password with his security answer', () => {
        email.sendKeys('bjoern@' + config.get('application.domain'))
        browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
        securityAnswer.sendKeys('West-2082')
        newPassword.sendKeys('monkey summer birthday are all bad passwords but work just fine in a long passphrase')
        newPasswordRepeat.sendKeys('monkey summer birthday are all bad passwords but work just fine in a long passphrase')
        resetButton.click()

        expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
      })

      protractor.expect.challengeSolved({ challenge: 'Reset Bjoern\'s Password Tier 2' })
    })

    describe('for his OWASP account', () => {
      it('should be able to reset password with his security answer', () => {
        email.sendKeys('bjoern@owasp.org')
        browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
        securityAnswer.sendKeys('Zaya')
        newPassword.sendKeys('kitten lesser pooch karate buffoon indoors')
        newPasswordRepeat.sendKeys('kitten lesser pooch karate buffoon indoors')
        resetButton.click()

        expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
      })

      protractor.expect.challengeSolved({ challenge: 'Reset Bjoern\'s Password Tier 1' })
    })
  })

  describe('as Morty', () => {
    it('should be able to reset password with his security answer', () => {
      email.sendKeys('morty@' + config.get('application.domain'))
      browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
      securityAnswer.sendKeys('5N0wb41L')
      newPassword.sendKeys('iBurri3dMySe1fInTheB4ckyard!')
      newPasswordRepeat.sendKeys('iBurri3dMySe1fInTheB4ckyard!')
      resetButton.click()

      expect($('.confirmation').getAttribute('hidden')).not.toBeTruthy()
    })

    protractor.expect.challengeSolved({ challenge: 'Reset Morty\'s Password' })
  })
})
