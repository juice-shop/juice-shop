const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('currentUser', function () {
  let retrieveLoggedInUser, req, res

  beforeEach(function () {
    retrieveLoggedInUser = require('../../routes/currentUser')
    req = { headers: { } }
    res = { json: sinon.spy() }
  })

  it('should return neither ID nor email if no authorization token was present in the request headers', function () {
    req.headers = { }
    retrieveLoggedInUser()(req, res)
    expect(res.json).to.have.been.calledWith({ user: { id: undefined, email: undefined } })
  })

  it('should return ID and email of user belonging to authorization token from the request', function () {
    req.headers = { authorization: 'Bearer token12345' }
    require('../../lib/insecurity').authenticatedUsers.put('token12345', {data: {id: 42, email: 'test@juice-sh.op'}})
    retrieveLoggedInUser()(req, res)
    expect(res.json).to.have.been.calledWith({ user: { id: 42, email: 'test@juice-sh.op' } })
  })
})
