import './commands'
import './setup'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
