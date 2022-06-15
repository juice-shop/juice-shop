describe("/", () => {
  describe('challenge "easterEgg2"', () => {
    it('should be able to access "secret" url for easter egg', () => {
      cy.visit(
        "/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg"
      );
      cy.expectChallengeSolved({ challenge: "Nested Easter Egg" });
    });
  });

  describe('challenge "premiumPaywall"', () => {
    it('should be able to access "super secret" url for premium content', () => {
      // cy.visit requires a text/html response and this is an image hence cy.request has been used
      cy.request(
        "/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us"
      );
      cy.expectChallengeSolved({ challenge: "Premium Paywall" });
    });
  });

  describe('challenge "privacyPolicyProof"', () => {
    it("should be able to access proof url for reading the privacy policy", () => {
      // cy.visit fails on a non 2xx status code hence passed the parameter
      cy.visit(
        "/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility",
        { failOnStatusCode: false }
      );
      cy.expectChallengeSolved({ challenge: "Privacy Policy Inspection" });
    });
  });

  describe('challenge "extraLanguage"', () => {
    it("should be able to access the Klingon translation file", () => {
      // cy.visit requires a text/html response and this is an image hence cy.request has been used
      cy.request("/assets/i18n/tlh_AA.json");
      cy.expectChallengeSolved({ challenge: "Extra Language" });
    });
  });

  describe('challenge "retrieveBlueprint"', () => {
    it("should be able to access the blueprint file", () => {
      cy.task("GetBlueprint").then((foundBlueprint: string) => {
        // cy.visit requires a text/html response and this is an STL file hence cy.request has been used
        cy.request(`/assets/public/images/products/${foundBlueprint}`);
      });
      cy.expectChallengeSolved({ challenge: "Retrieve Blueprint" });
    });
  });

  describe('challenge "missingEncoding"', () => {
    it("should be able to access the crazy cat photo", () => {
      // cy.visit requires a text/html response and this is an image hence cy.request has been used
      cy.request(
        "/assets/public/images/uploads/%F0%9F%98%BC-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg"
      );
      cy.expectChallengeSolved({ challenge: "Missing Encoding" });
    });
  });

  describe('challenge "securityPolicy"', () => {
    it("should be able to access the security.txt file", () => {
      // cy.visit requires a text/html response and this is an image hence cy.request has been used
      cy.request("/.well-known/security.txt");
      cy.expectChallengeSolved({ challenge: "Security Policy" });
    });
  });

  describe('challenge "emailLeak"', () => {
    it("should be able to request the callback on /rest/user/whoami", () => {
      // cy.visit requires a text/html response and this is a text/javascript hence cy.request has been used
      cy.request("/rest/user/whoami?callback=func");
      cy.expectChallengeSolved({ challenge: "Email Leak" });
    });
  });

  describe('challenge "accessLogDisclosure"', () => {
    it("should be able to access today's access log file", () => {
      // cy.visit requires a text/html response hence cy.request has been used
      cy.task("toISO8601").then((date: Date) => {
        cy.request(`/support/logs/access.log.${date}`);
      });
      cy.expectChallengeSolved({ challenge: "Access Log" });
    });
  });
});
