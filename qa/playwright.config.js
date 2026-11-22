const { defineConfig } = require('@playwright/test')

// Copie para qa/playwright.config.js somente se ainda não existir configuração.
// Se já existir, compare as opções e preserve os ajustes feitos pelo grupo.
module.exports = defineConfig({
  timeout: 60000,
  workers: 1,
  retries: 0,
  expect: { timeout: 10000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { browserName: 'chromium' }
    },
    {
      name: 'api',
      testDir: './tests/api'
    }
  ]
})
