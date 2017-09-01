const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('fileUpload', () => {
  let fileUpload, challenges, req, res
  const save = () => ({
    success: function () {}
  })

  beforeEach(() => {
    fileUpload = require('../../routes/fileUpload')
    challenges = require('../../data/datacache').challenges
    res = { status: sinon.stub() }
    res.status.returns({ end: function () {} })
    req = { file: { originalname: '' } }
  })

  it('should simply end HTTP response with status 204 "No Content"', () => {
    fileUpload()(req, res)

    expect(res.status).to.have.been.calledWith(204)
  })

  describe('should not solve "uploadSizeChallenge" when file size is', () => {
    const sizes = [0, 1, 100, 1000, 10000, 99999, 100000]
    sizes.forEach(size => {
      it(size + ' bytes', () => {
        challenges.uploadSizeChallenge = { solved: false, save: save }
        req.file.size = size

        fileUpload()(req, res)

        expect(challenges.uploadSizeChallenge.solved).to.equal(false)
      })
    })
  })

  it('should solve "uploadSizeChallenge" when file size exceeds 100000 bytes', () => {
    challenges.uploadSizeChallenge = { solved: false, save: save }
    req.file.size = 100001

    fileUpload()(req, res)

    expect(challenges.uploadSizeChallenge.solved).to.equal(true)
  })

  it('should solve "uploadTypeChallenge" when file type is not PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save: save }
    req.file.originalname = 'hack.exe'

    fileUpload()(req, res)

    expect(challenges.uploadTypeChallenge.solved).to.equal(true)
  })

  it('should not solve "uploadTypeChallenge" when file type is PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save: save }
    req.file.originalname = 'hack.pdf'

    fileUpload()(req, res)

    expect(challenges.uploadTypeChallenge.solved).to.equal(false)
  })
})
