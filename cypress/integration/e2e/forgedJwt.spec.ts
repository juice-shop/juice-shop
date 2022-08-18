describe("/", () => {
  describe('challenge "jwtUnsigned"', () => {
    xit("should accept an unsigned token with email jwtn3d@juice-sh.op in the payload ", () => {
      cy.window().then(() => {
        localStorage.setItem(
          "token",
          "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ."
        );
      });
      cy.visit("/");
      cy.expectChallengeSolved({ challenge: "Unsigned JWT" });
    });
  });

  describe('challenge "jwtForged"', () => {
    xit("should accept a token HMAC-signed with public RSA key with email rsa_lord@juice-sh.op in the payload ", () => {
      cy.task("disableOnWindowsEnv").then((disableOnWindowsEnv) => {
        if (!disableOnWindowsEnv) {
          cy.window().then(() => {
            localStorage.setItem(
              "token",
              "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTgzMDM3NzExfQ.gShXDT5TrE5736mpIbfVDEcQbLfteJaQUG7Z0PH8Xc8"
            );
          });
          cy.visit("/#/");

          cy.expectChallengeSolved({ challenge: "Forged Signed JWT" });
        }
      });
    });
  });
});
