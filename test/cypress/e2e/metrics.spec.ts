describe("/metrics/", () => {
  describe('challenge "exposedMetrics"', () => {
    it("Challenge is solved on accessing the /metrics route", () => {
      cy.request("/metrics");
      cy.expectChallengeSolved({ challenge: "Exposed Metrics" });
    });
  });
});
