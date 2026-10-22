import { type Challenge } from '../../../data/types'

Cypress.Commands.add(
  'expectChallengeSolved',
  (context: { challenge: string }) => {
    cy.request({
      method: 'GET',
      url: '/api/Challenges/?name=' + context.challenge,
      timeout: 60000
    }).then((response) => {
      let challenge: Challenge = response.body.data[0]

      if (!challenge.solved) {
        cy.wait(2000)
        cy.request({
          method: 'GET',
          url: '/api/Challenges/?name=' + context.challenge,
          timeout: 60000
        }).then((secondResponse) => {
          challenge = secondResponse.body.data[0]
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          expect(challenge.solved).to.be.true
        })
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(challenge.solved).to.be.true
      }
    })
  }
)

Cypress.Commands.add(
  'login',
  (context: { email: string, password: string, totpSecret?: string }) => {
    cy.visit('/#/login')
    if (context.email.match(/\S+@\S+\.\S+/) != null) {
      cy.get('#email').type(context.email)
    } else {
      cy.task<string>('GetFromConfig', 'application.domain').then(
        (appDomain: string) => {
          const email = context.email.concat('@', appDomain)
          cy.get('#email').type(email)
        }
      )
    }
    cy.get('#password').type(context.password)
    cy.get('#loginButton').click()
    if (context.totpSecret) {
      cy.location('hash').should('include', '/2fa/enter')
      cy.task<string>('GenerateAuthenticator', context.totpSecret).then(
        (totpToken: string) => {
          cy.get('#totpToken').type(totpToken)
          cy.get('#totpSubmitButton').click()
        }
      )
      cy.location('hash').should('include', '/search')
    } else {
      cy.location('hash').should('include', '/search')
    }
    cy.getCookie('token').should((cookie) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(cookie?.value).to.be.ok
    })
  }
)

function walkRecursivelyInArray (arr: number[], cb: any, index = 0) {
  if (arr.length === 0) return
  const ret = cb(index, arr.shift());

  ((ret && ret.chainerId) ? ret : cy.wrap(ret))
    .then((ret: boolean) => {
      if (!ret) return
      walkRecursivelyInArray(arr, cb, index + 1)
    })
}

Cypress.Commands.add('eachSeries', { prevSubject: 'optional' } as any, (arrayGenerated: number[], checkFnToBeRunOnEach: any) => {
  walkRecursivelyInArray(arrayGenerated, checkFnToBeRunOnEach)
})
