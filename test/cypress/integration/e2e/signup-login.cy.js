/// <reference types="cypress" />

describe('Signup With new credentials"', () => {
  let randomString = Math.random().toString(36).substring(2);
  const email = 'auto_' + randomString + '@gmail.com';
  const password = "Password1";
  const securityAnswer = "Hello";
  describe('UI Test', () => {

    beforeEach(() => {
      cy.log('Email:' + email)
      cy.log('Password:' + password)
      cy.visit('http://localhost:3000/#/')

      cy.get('#navbarAccount .mat-button-wrapper span').click()
      cy.get('#navbarLoginButton span').click()
    })

    it('should be able to signup', () => {

      cy.get('#newCustomerLink .primary-link').click()
      cy.get('#emailControl').type(email)
      cy.get('#passwordControl').type(password)
      cy.get('#repeatPasswordControl').type(password)
      cy.get('.mat-select-arrow').click()
      cy.get('#mat-option-4 span').click()
      cy.get('#securityAnswerControl').type(securityAnswer)
      cy.get('#registerButton .mat-button-wrapper').click();
      cy.get('.mat-simple-snack-bar-content').contains('Registration completed successfully.')
    })

    it('should be able to loginup', () => {

      cy.get('#email').type(email)
      cy.get('#password').type(password)
      cy.get('#loginButton').click()
      cy.get('.fa-layers-counter').contains(0)
    })
  })

  describe('API Test', () => {
    const userCredentials = {
      'email': email,
      'password': password
    }
    it('Shoould be login via API', () => {
      cy.request('POST', 'http://localhost:3000/rest/user/login', userCredentials)
      .then((response) => {
        expect(response.status).to.eq(200)
      })
    })
    it('Login via token of the API', () => {
      cy.request('POST', 'http://localhost:3000/rest/user/login', userCredentials)
      .its('body').then(body => {
        const token = body.authentication.token
        cy.wrap(token)

        cy.visit('http://localhost:3000/', {
          onBeforeLoad(browser) {
            browser.localStorage.setItem('token', token)
          }
        })
        cy.wait(2000)
        cy.get('.fa-layers-counter').contains(0)
        
      })
    })
  })
})