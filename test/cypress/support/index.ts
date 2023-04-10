// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './setup'

// Alternatively you can use CommonJS syntax:
// require('./commands')

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
