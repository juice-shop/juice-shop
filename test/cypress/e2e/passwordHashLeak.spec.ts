/// <reference types="cypress" />

describe('challenge "Password Hash Leak"', () => {
  beforeEach(() => {
    cy.login({ email: 'admin@juice-sh.op', password: 'admin123' })
  })

  it('should solve the challenge by leaking the password hash', () => {
    cy.request({
      method: 'GET',
      url: '/rest/user/whoami?showSensitive=true',
      headers: {
        // Cypress automatically handles cookies after cy.login
      }
    }).then((res) => {
      expect(res.body.user.passwordHash).to.exist
      cy.expectChallengeSolved({ challenge: 'Password Hash Leak' })
    })
  })
})
