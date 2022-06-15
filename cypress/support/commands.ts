// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { Challenge } from "../../data/types";

Cypress.Commands.add(
  "expectChallengeSolved",
  (context: { challenge: string }) => {
  cy.wait(2000);
    cy.request("GET", "/api/Challenges/?name=" + context.challenge).then(
      (response) => {
        let challenge: Challenge = response.body.data[0];
        expect(challenge.solved).to.be.true;
      }
    );
  }
);

Cypress.Commands.add(
  "login",
  (context: { email: string; password: string; totpSecret?: string }) => {
    cy.visit("/#/login");
    if (context.email.match(/\S+@\S+\.\S+/)) {
      cy.get("#email").type(context.email);
    } else {
      cy.task("GetFromConfig", "application.domain").then(
        (appDomain: string) => {
          let email = context.email.concat("@", appDomain);
          cy.get("#email").type(email);
        }
      );
    }
    cy.get("#password").type(context.password);
    cy.get("#loginButton").click();
    cy.wait(2000);
  }
);
