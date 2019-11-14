const config = require('config')

describe('/#/deluxe-membership', () => {
  describe('challenge "svgInjection"', () => {
    protractor.beforeEach.login({ email: 'jim@' + config.get('application.domain'), password: 'ncc-1701' })

    it('should be possible to pass in a forgotten test parameter abusing the redirect-endpoint to load an external image', () => {
      browser.get('/#/deluxe-membership?testDecal=..%2F..%2F..%2F..%2Fredirect%3Fto%3Dhttps:%2F%2Fplacekitten.com%2Fg%2F200%2F100%3Fx%3Dhttps:%2F%2Fgithub.com%2Fbkimminich%2Fjuice-shop')
    })

    protractor.expect.challengeSolved({ challenge: 'Cross-Site Imaging' })
  })
})
