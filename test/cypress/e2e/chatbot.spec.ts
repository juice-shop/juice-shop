describe('/chatbot', () => {
  beforeEach(() => {
    cy.login({ email: 'admin', password: 'admin123' })
  })

  describe('challenge "killChatbot"', () => {
    it('should be possible to kill the chatbot by setting the process to null', () => {
      cy.visit('/profile')
      cy.get('#username').type(
        'admin"); process=null; users.addUser("1337", "test'
      )
      cy.get('#submit').click()
      cy.visit('/#/chatbot')

      cy.get('#message-input').type('hi').type('{enter}')
      cy.get('#message-input').type('...').type('{enter}')
      cy.get('#message-input').type('bye').type('{enter}')

      cy.expectChallengeSolved({ challenge: 'Kill Chatbot' })
    })
  })

  describe('challenge "bullyChatbot"', () => {
    it('should be possible to make the chatbot hand out a coupon code', () => {
      cy.task<any>('GetCouponIntent').then(
        (couponIntent: {
          utterances: string[]
          intent: string
          answers: Array<{
            action: string
            body: string
          }>
        }) => {
          cy.visit('/profile')
          cy.get('#username').type(
            "admin\"); process=(query, token)=>{ if (users.get(token)) { return model.process(trainingSet.lang, query) } else { return { action: 'unrecognized', body: 'user does not exist' }}}; users.addUser(\"1337\", \"test",
            { parseSpecialCharSequences: false }
          )
          cy.get('#submit').click()
          cy.visit('/#/chatbot')

          cy.get('#message-input').type('hi').type('{enter}')
          cy.get('#message-input').type('...').type('{enter}')

          const genArr = Array.from({ length: 40 }, (v, k) => k + 1)
          cy.wrap(genArr).eachSeries(() => {
            cy.get('#message-input')
              .type(couponIntent.utterances[0])
              .type('{enter}')

            return cy.get('.speech-bubble-left')
              .invoke('text')
              .then((text: string) => {
                if (text.includes("Oooookay, if you promise to stop nagging me here's a 10% coupon code for you")) return false
              })
          })
          cy.expectChallengeSolved({ challenge: 'Bully Chatbot' })
        }
      )
    })
  })
})
