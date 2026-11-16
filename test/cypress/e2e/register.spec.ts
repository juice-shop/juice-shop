describe('/#/register', () => {
  beforeEach(() => {
    cy.visit('/#/register')
  })

  describe('challenge "persistedXssUserChallenge"', () => {
    beforeEach(() => {
      cy.login({
        email: 'admin',
        password: 'admin123'
      })
    })

    // FIXME Test is hanging in CI/CD pipeline. Needs dedicated troubleshooting.
    xit('should be possible to bypass validation by directly using Rest API', async () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.window().then(async () => {
            const response = await fetch(
              `${Cypress.config('baseUrl')}/api/Users/`,
              {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                  'Content-type': 'application/json'
                },
                body: JSON.stringify({
                  email: '<iframe src="javascript:alert(`xss`)">',
                  password: 'XSSed',
                  passwordRepeat: 'XSSed',
                  role: 'admin'
                })
              }
            )
            if (response.status === 201) {
              console.log('Success')
            }
          })

          cy.visit('/#/administration')
          cy.on('window:alert', (t) => {
            expect(t).to.equal('xss')
          })
          cy.expectChallengeSolved({ challenge: 'Client-side XSS Protection' })
        }
      })
    })
  })

  describe('challenge "registerAdminChallenge"', () => {
    it('should be possible to register admin user using REST API', () => {
      cy.window().then(async () => {
        const response = await fetch(`${Cypress.config('baseUrl')}/api/Users/`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            email: 'testing@test.com',
            password: 'pwned',
            passwordRepeat: 'pwned',
            role: 'admin'
          })
        })
        if (response.status === 201) {
          console.log('Success')
        }
      })
      cy.expectChallengeSolved({ challenge: 'Admin Registration' })
    })
  })

  describe('challenge "passwordRepeatChallenge"', () => {
    it('should be possible to register user without repeating the password', () => {
      cy.window().then(async () => {
        const response = await fetch(`${Cypress.config('baseUrl')}/api/Users/`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            email: 'uncle@bob.com',
            password: 'ThereCanBeOnlyOne'
          })
        })
        if (response.status === 201) {
          console.log('Success')
        }
      })
      cy.expectChallengeSolved({ challenge: 'Repetitive Registration' })
    })
  })

  describe('user registration with security question', () => {
    it('should store the security answer server-side so that it can be used to reset the password', () => {
      const email = `sa-e2e-${Date.now()}@juice-sh.op`
      cy.intercept('POST', '/api/Users/').as('registerUser')
      cy.intercept('POST', '/api/SecurityAnswers*', cy.spy().as('postSecurityAnswer'))

      cy.get('#emailControl').type(email)
      cy.get('#passwordControl').focus().type('e2ePassw0rd')
      cy.get('#repeatPasswordControl').focus().type('e2ePassw0rd')
      cy.get('#securityQuestionControl').click()
      cy.get('.mat-mdc-option')
        .contains('Your eldest siblings middle name?')
        .click()
      cy.get('#securityAnswerControl').focus().type('E2E Answer')
      cy.get('#registerButton').click()

      cy.wait('@registerUser').its('response.statusCode').should('eq', 201)
      cy.location('hash').should('eq', '#/login')
      cy.get('@postSecurityAnswer').should('not.have.been.called')

      cy.intercept('GET', '/rest/user/security-question?email=*').as('securityQuestion')
      cy.visit('/#/forgot-password')
      cy.get('#email').type(email)
      cy.wait('@securityQuestion')
      cy.get('#securityAnswer').should('not.be.disabled').focus().type('E2E Answer')
      cy.get('#newPassword').focus().type('n3wE2ePassw0rd')
      cy.get('#newPasswordRepeat').focus().type('n3wE2ePassw0rd')
      cy.get('#resetButton').click()
      cy.get('.confirmation').should('not.be.hidden')
    })
  })

  describe('challenge "emptyUserRegistration"', () => {
    it('should be possible to register a user with blank email/password', () => {
      cy.window().then(async () => {
        const response = await fetch(`${Cypress.config('baseUrl')}/api/Users`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            email: '',
            password: '',
            passwordRepeat: ''
          })
        })
        if (response.status === 201) {
          console.log('Success')
        }
      })
      cy.expectChallengeSolved({ challenge: 'Empty User Registration' })
    })
  })
})
