describe("/#/track-order", () => {
  describe('challenge "reflectedXss"', () => {
    // Cypress alert bug
    xit("Order Id should be susceptible to reflected XSS attacks", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
        }
        cy.on("uncaught:exception", (err, runnable) => {
          return false;
        });

        cy.visit("/#/track-result");
        cy.visit('/#/track-result?id=<iframe src="javascript:alert(`xss`)">');
        cy.reload();

        cy.on("window:alert", (t) => {
          expect(t).to.equal("xss");
        });

        cy.expectChallengeSolved({ challenge: "Reflected XSS" });
      });
    });
  });
});
