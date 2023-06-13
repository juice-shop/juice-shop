import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  env: {
    baseUrl: 'http://localhost:3000',
  },
  downloadsFolder: 'test/cypress/downloads',
  fixturesFolder: 'test/cypress/fixtures',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./test/cypress/plugins/index.ts').default(on, config)
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'test/cypress/support/index.ts',
    experimentalStudio: true
  },
})
