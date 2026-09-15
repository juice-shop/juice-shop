describe('/#/privacy-security/privacy-policy', () => {
  describe('challenge "privacyPolicyChallenge"', () => {
    it('should be possible to access privacy policy', () => {
      cy.visit('/#/privacy-security/privacy-policy')
      cy.url().should('match', /\/privacy-policy/)
      cy.expectChallengeSolved({ challenge: 'Privacy Policy' })
    })
  })
})
