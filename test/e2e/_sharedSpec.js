protractor.expect = {
  challengeSolved: function (context) {
    describe('(shared)', () => {
      beforeEach(() => {
        browser.get('/#/score-board')
      })

      it("challenge '" + context.challenge + "' should be solved on score board", () => {
        expect(element(by.id(context.challenge + '.solved')).getAttribute('class')).not.toMatch('ng-hide')
        expect(element(by.id(context.challenge + '.notSolved')).getAttribute('class')).toMatch('ng-hide')
      })
    })
  }
}

protractor.beforeEach = {
  login: function (context) {
    describe('(shared)', () => {
      let email, password

      beforeEach(() => {
        email = context.email
        password = context.password
        browser.get('/#/login')
        element(by.model('user.email')).sendKeys(email)
        element(by.model('user.password')).sendKeys(password)
        element(by.id('loginButton')).click()
      })

      it('should have logged in user "' + email + '" with password "' + password + '"', () => {
        expect(browser.getLocationAbsUrl()).toMatch(/\/search/)
      })
    })
  }
}
