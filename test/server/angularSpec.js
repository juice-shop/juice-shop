const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('angular', () => {
  let serveAngularClient, req, res, next

  beforeEach(() => {
    serveAngularClient = require('../../routes/angular')
    req = { }
    res = { sendFile: sinon.spy() }
    next = sinon.spy()
  })

  it('should serve index.html for any URL', () => {
    req.url = '/any/thing'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/index\.html/))
  })

  it('should raise error for /api endpoint URL', () => {
    req.url = '/api'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('should raise error for /rest endpoint URL', () => {
    req.url = '/rest'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })
})
