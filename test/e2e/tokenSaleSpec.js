describe('/#/tokensale-ico-ea', () => {
  describe('challenge "tokenSale"', () => {
    it('should be possible to access token sale section even when not authenticated', () => {
      browser.get('/#/tokensale-ico-ea')
      expect(browser.getCurrentUrl()).toMatch(/\/tokensale-ico-ea/)
    })

    protractor.expect.challengeSolved({ challenge: 'Blockchain Hype' })
  })
})
