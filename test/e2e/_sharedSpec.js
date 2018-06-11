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

      beforeEach(() => {
        browser.get('/#/login')
        element(by.model('user.email')).sendKeys(context.email)
        element(by.model('user.password')).sendKeys(context.password)
        element(by.id('loginButton')).click()
      })

      it('should have logged in user "' + context.email + '" with password "' + context.password + '"', () => {
        expect(browser.getCurrentUrl()).toMatch(/\/search/) // TODO Instead check for uib-tooltip of <i> with fa-user-circle
      })
    })
  }
}
