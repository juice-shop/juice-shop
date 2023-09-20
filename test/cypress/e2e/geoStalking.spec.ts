describe('/#/photo-wall', () => {
  beforeEach(() => {
    cy.visit('/#/forgot-password')
  })

  describe('challenge "geoStalkingMeta"', () => {
    it('Should be possible to find the answer to a security question in the meta-data of a photo on the photo wall', () => {
      cy.task<string>('GetFromMemories', 'geoStalkingMetaSecurityAnswer').then(
        (answer: string) => {
          cy.task('GetFromConfig', 'application.domain').then((appDomain) => {
            cy.get('#email').type(`john@${appDomain}`)
            cy.get('#securityAnswer').type(answer)
            cy.get('#newPassword').type('123456')
            cy.get('#newPasswordRepeat').type('123456')
            cy.get('#resetButton').click()

            cy.expectChallengeSolved({ challenge: 'Meta Geo Stalking' })
          })
        }
      )
    })
  })

  describe('challenge "geoStalkingVisual"', () => {
    it('Should be possible to determine the answer to a security question by looking closely at an image on the photo wall', () => {
      cy.task<string>('GetFromMemories', 'geoStalkingVisualSecurityAnswer').then(
        (answer: string) => {
          cy.task('GetFromConfig', 'application.domain').then((appDomain) => {
            cy.get('#email').type(`emma@${appDomain}`)
            cy.get('#securityAnswer').type(answer)
            cy.get('#newPassword').type('123456')
            cy.get('#newPasswordRepeat').type('123456')
            cy.get('#resetButton').click()

            cy.expectChallengeSolved({ challenge: 'Visual Geo Stalking' })
          })
        }
      )
    })
  })
})
