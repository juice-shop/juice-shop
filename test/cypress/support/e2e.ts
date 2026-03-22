import './commands'
import './setup'

declare global {

  namespace Cypress {
    interface Chainable {
      expectChallengeSolved: (value: { challenge: string }) => void
      login: (value: {
        email: string
        password: string
        totpSecret?: string
      }) => void
      eachSeries: any

    }
  }
}
