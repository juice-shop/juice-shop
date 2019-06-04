const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('fileServer', () => {
  const servePublicFiles = require('../../routes/fileServer')
  const challenges = require('../../data/datacache').challenges

  beforeEach(() => {
    this.res = { sendFile: sinon.spy(), status: sinon.spy() }
    this.req = { params: {}, query: {} }
    this.next = sinon.spy()
    this.save = () => ({
      then () { }
    })
  })

  it('should serve PDF files from folder /ftp', () => {
    this.req.params.file = 'test.pdf'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]test\.pdf/))
  })

  it('should serve Markdown files from folder /ftp', () => {
    this.req.params.file = 'test.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]test\.md/))
  })

  it('should serve incident-support.kdbx files from folder /ftp', () => {
    this.req.params.file = 'incident-support.kdbx'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]incident-support\.kdbx/))
  })

  it('should raise error for slashes in filename', () => {
    this.req.params.file = '../../../../nice.try'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('should raise error for disallowed file type', () => {
    this.req.params.file = 'nice.try'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('should solve "directoryListingChallenge" when requesting acquisitions.md', () => {
    challenges.directoryListingChallenge = { solved: false, save: this.save }
    this.req.params.file = 'acquisitions.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]acquisitions\.md/))
    expect(challenges.directoryListingChallenge.solved).to.equal(true)
  })

  it('should solve "easterEggLevelOneChallenge" when requesting eastere.gg with Poison Null Byte attack', () => {
    challenges.easterEggLevelOneChallenge = { solved: false, save: this.save }
    this.req.params.file = 'eastere.gg%00.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]eastere\.gg/))
    expect(challenges.easterEggLevelOneChallenge.solved).to.equal(true)
  })

  it('should solve "forgottenDevBackupChallenge" when requesting package.json.bak with Poison Null Byte attack', () => {
    challenges.forgottenDevBackupChallenge = { solved: false, save: this.save }
    this.req.params.file = 'package.json.bak%00.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]package\.json\.bak/))
    expect(challenges.forgottenDevBackupChallenge.solved).to.equal(true)
  })

  it('should solve "forgottenBackupChallenge" when requesting coupons_2013.md.bak with Poison Null Byte attack', () => {
    challenges.forgottenBackupChallenge = { solved: false, save: this.save }
    this.req.params.file = 'coupons_2013.md.bak%00.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]coupons_2013\.md\.bak/))
    expect(challenges.forgottenBackupChallenge.solved).to.equal(true)
  })

  it('should solve "misplacedSignatureFileChallenge" when requesting suspicious_errors.yml with Poison Null Byte attack', () => {
    challenges.misplacedSignatureFileChallenge = { solved: false, save: this.save }
    this.req.params.file = 'suspicious_errors.yml%00.md'

    servePublicFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/ftp[/\\]suspicious_errors\.yml/))
    expect(challenges.misplacedSignatureFileChallenge.solved).to.equal(true)
  })
})
