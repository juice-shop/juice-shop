describe('/#/forgot-password', () => {
  const unchangedAdminPassword = `admin${123}`

  beforeEach(() => {
    cy.get('body').then(($body) => {
      if ($body.find('#logout').length) {
        cy.get('#logout').click()
      }
    })
    cy.visit('/#/forgot-password')
    cy.intercept('GET', '/rest/user/security-question?email=*').as('securityQuestion')
  })

  describe('as Jim', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`jim@${appDomain}`)
        }
      )
      cy.wait('@securityQuestion')
      cy.get('#securityAnswer').should('not.be.disabled').focus().type('Samuel')
      // recordings to properly fix behavior during test
      cy.get('#newPassword').focus().type('I <3 Spock')
      cy.get('#newPasswordRepeat').focus().type('I <3 Spock')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Jim's Password" })
    })
  })

  describe('as Admin', () => {
    it('should be able to reset password with a leaked reset token', () => {
      cy.login({ email: 'jim', password: 'ncc-1701' })
      cy.visit('/#/forgot-password')
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          const email = `admin@${appDomain}`
          cy.get('#email').type(email)
          cy.wait('@securityQuestion')
          cy.window().then((window) => {
            cy.request({
              method: 'GET',
              url: '/api/Complaints/',
              headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`
              }
            }).then(({ body }) => {
              const complaint = [...body.data].reverse().find((entry: { message?: string }) => entry.message?.includes(email))
              if (!complaint) {
                throw new Error(`No leaked reset token complaint found for ${email}`)
              }
              const token = complaint?.message?.match(/: ([a-f0-9]{32})$/i)?.[1]

              expect(token).to.match(/^[a-f0-9]{32}$/)
              cy.get('#securityAnswer').should('not.be.disabled').focus().type(token)
            })
          })
        }
      )
      cy.get('#newPassword').focus().type(unchangedAdminPassword)
      cy.get('#newPasswordRepeat').focus().type(unchangedAdminPassword)
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Admin's Password" })
    })
  })

  describe('as Bender', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`bender@${appDomain}`)
        }
      )
      cy.wait('@securityQuestion')
      cy.get('#securityAnswer').should('not.be.disabled').focus().type("Stop'n'Drop")
      // recordings to properly fix behavior during test
      cy.get('#newPassword').focus().type('Brannigan 8=o Leela')
      cy.get('#newPasswordRepeat').focus().type('Brannigan 8=o Leela')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Bender's Password" })
    })
  })

  describe('as Bjoern', () => {
    describe('for his internal account', () => {
      it('should be able to reset password with his security answer', () => {
        cy.task<string>('GetFromConfig', 'application.domain').then(
          (appDomain: string) => {
            cy.get('#email').type(`bjoern@${appDomain}`)
          }
        )
        cy.wait('@securityQuestion')
        cy.get('#securityAnswer').should('not.be.disabled').focus().type('West-2082')
        // recordings to properly fix behavior during test
        cy.get('#newPassword').focus().type('monkey birthday ')
        cy.get('#newPasswordRepeat').focus().type('monkey birthday ')
        cy.get('#resetButton').click()

        cy.get('.confirmation').should('not.be.hidden')
        cy.expectChallengeSolved({ challenge: "Reset Bjoern's Password" })
      })
    })

    describe('for his OWASP account', () => {
      it('should be able to reset password with his security answer', () => {
        cy.get('#email').type('bjoern@owasp.org')
        cy.wait('@securityQuestion')
        cy.get('#securityAnswer').should('not.be.disabled').focus().type('Zaya')
        // recordings to properly fix behavior during test
        cy.get('#newPassword').focus().type('kitten lesser pooch')
        cy.get('#newPasswordRepeat').focus().type('kitten lesser pooch')
        cy.get('#resetButton').click()

        cy.get('.confirmation').should('not.be.hidden')
        cy.expectChallengeSolved({ challenge: "Bjoern's Favorite Pet" })
      })
    })
  })

  describe('as Morty', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`morty@${appDomain}`)
        }
      )
      cy.wait('@securityQuestion')
      cy.get('#securityAnswer').should('not.be.disabled').focus().type('5N0wb41L')
      // recordings to properly fix behavior during test
      cy.get('#newPassword').focus().type('iBurri3dMySe1f!')
      cy.get('#newPasswordRepeat').focus().type('iBurri3dMySe1f!')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Morty's Password" })
    })
  })

  describe('as Uvogin', () => {
    it('should be able to reset password with his security answer', () => {
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          cy.get('#email').type(`uvogin@${appDomain}`)
        }
      )
      cy.wait('@securityQuestion')
      cy.get('#securityAnswer').should('not.be.disabled').focus().type('Silence of the Lambs')
      // Cypress recordings to properly fix behavior during test
      cy.get('#newPassword').focus().type('ora-ora > muda-muda')
      cy.get('#newPasswordRepeat').focus().type('ora-ora > muda-muda')
      cy.get('#resetButton').click()

      cy.get('.confirmation').should('not.be.hidden')
      cy.expectChallengeSolved({ challenge: "Reset Uvogin's Password" })
    })
  })
})
