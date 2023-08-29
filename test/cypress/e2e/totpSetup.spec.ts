describe('/#/basket', () => {
  describe('as wurstbrot', () => {
    beforeEach(() => {
      cy.login({
        email: 'wurstbrot',
        password: 'EinBelegtesBrotMitSchinkenSCHINKEN!',
        totpSecret: 'IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH'
      })
    })

    it('should show an success message for 2fa enabled accounts', () => {
      cy.visit('/#/privacy-security/two-factor-authentication')
    })
  })

  describe('as amy', () => {
    beforeEach(() => {
      cy.login({
        email: 'amy',
        password: 'K1f.....................'
      })
    })

    it('should be possible to setup 2fa for a account without 2fa enabled', async () => {
      cy.visit('/#/privacy-security/two-factor-authentication')

      cy.get('#initalToken')
        .should('have.attr', 'data-test-totp-secret')
        .then(($val) => {
          // console.log($val);
          cy.get('#currentPasswordSetup').type('K1f.....................')

          cy.task('GenerateAuthenticator', $val).then((secret: string) => {
            cy.get('#initalToken').type(secret)
            cy.get('#setupTwoFactorAuth').click()

            cy.get('#currentPasswordDisable').type('K1f.....................')
            cy.get('#disableTwoFactorAuth').click()
          })
        })
      cy.get('.mat-snack-bar-container').should(
        'contain',
        'Two-Factor Authentication has been removed.'
      )
    })
  })
})
