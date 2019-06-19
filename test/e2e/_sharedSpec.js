const otplib = require('otplib')

protractor.expect = {
  challengeSolved: function (context) {
    describe('(shared)', () => {
      beforeEach(() => {
        browser.get('/#/score-board')
      })

      it("challenge '" + context.challenge + "' should be solved on score board", () => {
        expect(element(by.id(context.challenge + '.solved')).isPresent()).toBeTruthy()
        expect(element(by.id(context.challenge + '.notSolved')).isPresent()).toBeFalsy()
      })
    })
  }
}

protractor.beforeEach = {
  login: function (context) {
    describe('(shared)', () => {
      beforeEach(() => {
        browser.get('/#/login')

        element(by.id('email')).sendKeys(context.email)
        element(by.id('password')).sendKeys(context.password)
        element(by.id('loginButton')).click()

        if (context.totpSecret) {
          const EC = protractor.ExpectedConditions
          const twoFactorTokenInput = element(by.id('totpToken'))
          const twoFactorSubmitButton = element(by.id('totpSubmitButton'))

          browser.wait(EC.visibilityOf(twoFactorTokenInput), 1000, '2FA token field did not become visible')

          const totpToken = otplib.authenticator.generate(context.totpSecret)
          twoFactorTokenInput.sendKeys(totpToken)

          twoFactorSubmitButton.click()
        }
      })

      it('should have logged in user "' + context.email + '" with password "' + context.password + '"', () => {
        expect(browser.getCurrentUrl()).toMatch(/\/search/) // TODO Instead check for uib-tooltip of <i> with fa-user-circle
      })
    })
  }
}
