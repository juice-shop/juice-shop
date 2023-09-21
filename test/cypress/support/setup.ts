import BrowserLaunchOptions = Cypress.BrowserLaunchOptions
import Browser = Cypress.Browser

beforeEach(() => {
  cy.setCookie('cookieconsent_status', 'dismiss')
  cy.setCookie('welcomebanner_status', 'dismiss')
  cy.setCookie('language', 'en')
})

module.exports = (on) => {
  on('before:browser:launch', (browser: Browser, launchOptions: BrowserLaunchOptions) => {
    console.log(launchOptions.args)

    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-gpu')
    }

    return launchOptions
  })
}
