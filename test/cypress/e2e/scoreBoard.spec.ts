describe('/#/score-board', () => {
  describe('challenge "scoreBoard"', () => {
    it('should be possible to access score board', () => {
      cy.visit('/#/score-board')
      cy.url().should('match', /\/score-board/)
      cy.expectChallengeSolved({ challenge: 'Score Board' })
    })
  })

  describe('challenge "continueCode"', () => {
    it('should be possible to solve the non-existent challenge #99', () => {
      cy.window().then(async () => {
        await fetch(
          `${Cypress.config('baseUrl')}/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkM6Ae9M7k2rK63YpqQLPjnlb5V5LvDj`,
          {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
              'Content-type': 'text/plain'
            }
          }
        )
      })
      cy.visit('/#/score-board')
      cy.expectChallengeSolved({ challenge: 'Imaginary Challenge' })
    })
  })
})

xdescribe('/#/score-board-legacy', () => { // TODO Replace with test based on new Score Board
  describe('repeat notification', () => {
    beforeEach(() => {
      cy.visit('/#/score-board-legacy')
    })

    it('should be possible in both when and when not in CTF mode', () => {
      cy.task('GetFromConfig', 'challenges.showSolvedNotifications').as(
        'showSolvedNotifications'
      )
      cy.task('GetFromConfig', 'ctf.showFlagsInNotifications').as(
        'showFlagsInNotifications'
      )

      cy.get('@showSolvedNotifications').then((showSolvedNotifications) => {
        cy.get('@showFlagsInNotifications').then((showFlagsInNotifications) => {
          if (showSolvedNotifications && showFlagsInNotifications) {
            cy.get('.challenge-solved-toast').then((arrayOfSolvedToasts) => {
              const alertsBefore = Cypress.$(arrayOfSolvedToasts).length
              cy.get('[id="Score Board.solved"]').click()

              cy.get('.challenge-solved-toast').should(
                'not.have.length',
                alertsBefore
              )
            })
          } else {
            cy.get('.challenge-solved-toast').then((arrayOfSolvedToasts) => {
              const alertsBefore = Cypress.$(arrayOfSolvedToasts).length
              cy.get('[id="Score Board.solved"]').click()

              cy.get('.challenge-solved-toast').should(
                'have.length',
                alertsBefore
              )
            })
          }
        })
      })
    })
  })
})
