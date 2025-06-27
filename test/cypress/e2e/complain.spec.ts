describe('/#/complain', () => {
  beforeEach(() => {
    cy.login({
      email: 'admin',
      password: 'admin123'
    })

    cy.visit('/#/complain')
  })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB directly through backend', () => {
      cy.window().then(async () => {
        const over100KB = Array.apply(null, new Array(11000)).map(
          // eslint-disable-next-line @typescript-eslint/unbound-method
          String.prototype.valueOf,
          '1234567890'
        )
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        await fetch(`${Cypress.config('baseUrl')}/file-upload`, {
          method: 'POST',
          cache: 'no-cache',
          body: data
        })
      })
      cy.expectChallengeSolved({ challenge: 'Upload Size' })
    })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf directly through backend', () => {
      cy.window().then(async () => {
        const data = new FormData()
        const blob = new Blob(['test'], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        await fetch(`${Cypress.config('baseUrl')}/file-upload`, {
          method: 'POST',
          cache: 'no-cache',
          body: data
        })
      })
      cy.expectChallengeSolved({ challenge: 'Upload Type' })
    })
  })

  describe('challenge "deprecatedInterface"', () => {
    it('should be possible to upload XML files', () => {
      cy.get('#complaintMessage').type('XML all the way!')
      cy.get('#file').selectFile('test/files/deprecatedTypeForServer.xml')
      cy.get('#submitButton').click()
      cy.expectChallengeSolved({ challenge: 'Deprecated Interface' })
    })
  })

  describe('challenge "xxeFileDisclosure"', () => {
    it('(triggered for Windows server via .xml upload with XXE attack)', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('XXE File Exfiltration Windows!')
          cy.get('#file').selectFile('test/files/xxeForWindows.xml')
          cy.get('#submitButton').click()
        }
      })
    })

    it('(triggered for Linux server via .xml upload with XXE attack)', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('XXE File Exfiltration Linux!')
          cy.get('#file').selectFile('test/files/xxeForLinux.xml')
          cy.get('#submitButton').click()
        }
      })
    })

    it('should be solved either through Windows- or Linux-specific attack path', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.expectChallengeSolved({ challenge: 'XXE Data Access' })
        }
      })
    })
  })

  describe('challenge "xxeDos"', () => {
    it('(triggered via .xml upload with dev/random attack)', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('XXE Dev Random!')
          cy.get('#file').selectFile('test/files/xxeDevRandom.xml')
          cy.get('#submitButton').click()
          cy.wait(5000) // Wait for 2.5x timeout of XML parser
        }
      })
    })

    it('(triggered via .xml upload with Quadratic Blowup attack)', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('XXE Quadratic Blowup!')
          cy.get('#file').selectFile('test/files/xxeQuadraticBlowup.xml')
          cy.get('#submitButton').click()
          cy.wait(5000) // Wait for 2.5x timeout of XML parser
        }
      })
    })

    xit('should be solved either through dev/random or Quadratic Blowup attack', () => { // FIXME Unreliable during CI/CD as sometimes the Quadratic Blowup is blocked for entity loops
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.expectChallengeSolved({ challenge: 'XXE DoS' })
        }
      })
    })
  })

  describe('challenge "yamlBomb"', () => {
    it('should be solved via .yaml upload with a Billion Laughs-style attack', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('YAML Bomb!')
          cy.get('#file').selectFile('test/files/yamlBomb.yml')
          cy.get('#submitButton').click()
          cy.wait(5000) // Wait for 2.5x possible timeout of YAML parser
          cy.expectChallengeSolved({ challenge: 'Memory Bomb' })
        }
      })
    })
  })

  describe('challenge "arbitraryFileWrite"', () => {
    it('should be possible to upload zip file with filenames having path traversal', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('Zip Slip!')
          cy.get('#file').selectFile('test/files/arbitraryFileWrite.zip')
          cy.get('#submitButton').click()
          cy.expectChallengeSolved({ challenge: 'Arbitrary File Write' })
        }
      })
    })
  })

  describe('challenge "videoXssChallenge"', () => {
    it('should be possible to inject js in subtitles by uploading zip file with filenames having path traversal', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.get('#complaintMessage').type('Here we go!')
          cy.get('#file').selectFile('test/files/videoExploit.zip')
          cy.get('#submitButton').click()
          cy.visit('/promotion')

          cy.on('window:alert', (t) => {
            expect(t).to.equal('xss')
          })
          cy.visit('/')
          cy.expectChallengeSolved({ challenge: 'Video XSS' })
        }
      })
    })
  })
})
