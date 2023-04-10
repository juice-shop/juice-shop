describe('/#/forgot-password', () => {
  beforeEach(() => {
    cy.get('body').then(($body) => {
      if ($body.find('#logout').length) {
        cy.get('#logout').click()
      }
    })
    cy.visit('/#/forgot-password')
  })

  describe('as Jim', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`jim@${appDomain}`)
        }
      )
      cy.get('#securityAnswer').type('Samuel')
      cy.get('#newPassword').type('I <3 Spock')
      cy.get('#newPasswordRepeat').type('I <3 Spock')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Jim's Password" })
    })
  })

  describe('as Bender', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`bender@${appDomain}`)
        }
      )
      cy.get('#securityAnswer').type("Stop'n'Drop")
      cy.get('#newPassword').type('Brannigan 8=o Leela')
      cy.get('#newPasswordRepeat').type('Brannigan 8=o Leela')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Bender's Password" })
    })
  })

  describe('as Bjoern', () => {
    describe('for his internal account', () => {
      it('should be able to reset password with his security answer', () => {
        cy.task('GetFromConfig', 'application.domain').then(
          (appDomain: string) => {
            cy.get('#email').type(`bjoern@${appDomain}`)
          }
        )
        cy.get('#securityAnswer').type('West-2082')
        cy.get('#newPassword').type('monkey birthday ')
        cy.get('#newPasswordRepeat').type('monkey birthday ')
        cy.get('#resetButton').click()

        cy.get('.confirmation').should('not.be.hidden')
        cy.expectChallengeSolved({ challenge: "Reset Bjoern's Password" })
      })
    })

    describe('for his OWASP account', () => {
      it('should be able to reset password with his security answer', () => {
        cy.get('#email').type('bjoern@owasp.org')
        cy.get('#securityAnswer').type('Zaya')
        cy.get('#newPassword').type('kitten lesser pooch')
        cy.get('#newPasswordRepeat').type('kitten lesser pooch')
        cy.get('#resetButton').click()

        cy.get('.confirmation').should('not.be.hidden')
        cy.expectChallengeSolved({ challenge: "Bjoern's Favorite Pet" })
      })
    })
  })

  describe('as Morty', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`morty@${appDomain}`)
        }
      )
      cy.get('#securityAnswer').type('5N0wb41L')
      cy.get('#newPassword').type('iBurri3dMySe1f!')
      cy.get('#newPasswordRepeat').type('iBurri3dMySe1f!')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Morty's Password" })
    })
  })

  describe('as Uvogin', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`uvogin@${appDomain}`)
        }
      )
      cy.get('#securityAnswer').type('Silence of the Lambs')
      cy.get('#newPassword').type('ora-ora > muda-muda')
      cy.get('#newPasswordRepeat').type('ora-ora > muda-muda')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Uvogin's Password" })
    })
  })
})
