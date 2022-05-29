describe("Cypress is ready for Juice Shop", () => {
  it("Visits Juice Shop homepage", () => {
    cy.visit("/");
  });

  it("Accepts the cookies", () => {
    cy.get(".cc-window").should("be.visible");
    cy.get(".cc-btn").click();
  });

  it("Dismisses the welcome message", () => {
    cy.get("#mat-dialog-0").should("be.visible");
    let text = ["Welcome to OWASP Juice Shop!", "https://owasp-juice.shop"];
    cy.get("h1").each((element, index) => {
      cy.wrap(element).should("have.text", text[index]);
    });

    cy.get(".close-dialog").click();
  });

  it("Verifies the title of the page", () => {
    cy.get(".logo").should("be.visible");
    cy.get('[routerlink="/search"] > .mat-button-wrapper > span').should(
      "have.text",
      " OWASP Juice Shop "
    );
  });
});
