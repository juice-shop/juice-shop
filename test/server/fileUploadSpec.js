const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('fileUpload', () => {
  const fileUpload = require('../../routes/fileUpload')
  const challenges = require('../../data/datacache').challenges

  beforeEach(() => {
    this.res = { status: sinon.stub() }
    this.res.status.returns({ end () { } })
    this.req = { file: { originalname: '' } }
    this.save = () => ({
      then () { }
    })
  })

  it('should simply end HTTP response with status 204 "No Content"', () => {
    fileUpload()(this.req, this.res)

    expect(this.res.status).to.have.been.calledWith(204)
  })

  describe('should not solve "uploadSizeChallenge" when file size is', () => {
    const sizes = [0, 1, 100, 1000, 10000, 99999, 100000]
    sizes.forEach(size => {
      it(size + ' bytes', () => {
        challenges.uploadSizeChallenge = { solved: false, save: this.save }
        this.req.file.size = size

        fileUpload()(this.req, this.res)

        expect(challenges.uploadSizeChallenge.solved).to.equal(false)
      })
    })
  })

  it('should solve "uploadSizeChallenge" when file size exceeds 100000 bytes', () => {
    challenges.uploadSizeChallenge = { solved: false, save: this.save }
    this.req.file.size = 100001

    fileUpload()(this.req, this.res)

    expect(challenges.uploadSizeChallenge.solved).to.equal(true)
  })

  it('should solve "uploadTypeChallenge" when file type is not PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save: this.save }
    this.req.file.originalname = 'hack.exe'

    fileUpload()(this.req, this.res)

    expect(challenges.uploadTypeChallenge.solved).to.equal(true)
  })

  it('should not solve "uploadTypeChallenge" when file type is PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save: this.save }
    this.req.file.originalname = 'hack.pdf'

    fileUpload()(this.req, this.res)

    expect(challenges.uploadTypeChallenge.solved).to.equal(false)
  })
})
