var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('keyServer', function () {
  var serveKeyFiles, req, res, next

  beforeEach(function () {
    serveKeyFiles = require('../../routes/keyServer')
    req = { params: { } }
    res = { sendFile: sinon.spy(), status: sinon.spy() }
    next = sinon.spy()
  })

  it('should serve requested file from folder /encryptionkeys', function () {
    req.params.file = 'test.file'

    serveKeyFiles()(req, res, next)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/encryptionkeys[/\\]test.file/))
  })

  it('should raise error for slashes in filename', function () {
    req.params.file = '../../../../nice.try'

    serveKeyFiles()(req, res, next)

    expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })
})
