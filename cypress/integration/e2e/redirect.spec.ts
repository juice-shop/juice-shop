describe("/redirect", () => {
  describe('challenge "redirect"', () => {
    it("should show error page when supplying an unrecognized target URL", () => {
      cy.visit("/redirect?to=http://kimminich.de", {
        failOnStatusCode: false,
      });
      cy.contains("Unrecognized target URL for redirect: http://kimminich.de");
    });
  });

  describe('challenge "redirect"', () => {
    it("should redirect to target URL if allowlisted URL is contained in it as parameter", () => {
      cy.visit(
        `/redirect?to=https://owasp.org?trickIndexOf=https://github.com/bkimminich/juice-shop`
      );
      cy.url().should("match", /https:\/\/owasp\.org/);
      cy.expectChallengeSolved({ challenge: "Allowlist Bypass" });
    });
  });

  describe('challenge "redirectCryptoCurrency"', () => {
    it("should still redirect to forgotten entry https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6 on allowlist", () => {
      cy.visit(
        `/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6`
      );
      cy.expectChallengeSolved({ challenge: "Outdated Allowlist" });
    });
  });
});
