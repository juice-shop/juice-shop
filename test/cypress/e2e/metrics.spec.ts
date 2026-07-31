describe('/metrics/', () => {
  describe('challenge "exposedMetricsChallenge"', () => {
    it('Challenge is solved on accessing the /metrics route', () => {
      cy.request('/metrics')
      cy.expectChallengeSolved({ challenge: 'Exposed Metrics' })
    })
  })
})
