describe('/ftp', () => {
  describe('challenge "directoryListingChallenge"', () => {
    it('should be able to access file /ftp/acquisitions.md', () => {
      cy.request('/ftp/acquisitions.md')
      cy.expectChallengeSolved({ challenge: 'Confidential Document' })
    })
  })

  describe('challenge "errorHandling"', () => {
    it('should leak information through error message accessing /ftp/easter.egg due to wrong file suffix', () => {
      cy.visit('/ftp/easter.egg', { failOnStatusCode: false })

      cy.get('#stacktrace').then((elements) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(!!elements.length).to.be.true
      })
      cy.expectChallengeSolved({ challenge: 'Error Handling' })
    })
  })

  describe('challenge "forgottenBackupChallenge"', () => {
    it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', () => {
      cy.request('/ftp/coupons_2013.md.bak%2500.md')
      cy.expectChallengeSolved({ challenge: 'Forgotten Sales Backup' })
    })
  })

  describe('challenge "forgottenDevBackupChallenge"', () => {
    it('should be able to access file /ftp/package.json.bak with poison null byte attack', () => {
      cy.request('/ftp/package.json.bak%2500.md')
      cy.expectChallengeSolved({ challenge: 'Forgotten Developer Backup' })
    })
  })

  describe('challenge "easterEggLevelOneChallenge"', () => {
    it('should be able to access file /ftp/easter.egg with poison null byte attack', () => {
      cy.request('/ftp/eastere.gg%2500.md')
      cy.expectChallengeSolved({ challenge: 'Easter Egg' })
    })
  })

  describe('challenge "misplacedSignatureFileChallenge"', () => {
    it('should be able to access file /ftp/suspicious_errors.yml with poison null byte attack', () => {
      cy.request('/ftp/suspicious_errors.yml%2500.md')
      cy.expectChallengeSolved({ challenge: 'Misplaced Signature File' })
    })
  })

  describe('challenge "nullByteChallenge"', () => {
    it('should be able to access file other than Markdown or PDF in /ftp with poison null byte attack', () => {
      cy.request('/ftp/encrypt.pyc%2500.md')
      cy.expectChallengeSolved({ challenge: 'Poison Null Byte' })
    })
  })
})
