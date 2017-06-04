var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('verify', function () {
  var verify = require('../../routes/verify')
  var challenges, req, res, next
  var save = function () { return {success: function () {}} }

  beforeEach(function () {
    challenges = require('../../data/datacache').challenges
    req = { body: {}, headers: {} }
    res = { json: sinon.spy() }
    next = sinon.spy()
  })

  describe('forgedFeedbackChallenge', function () {
    beforeEach(function () {
      require('../../lib/insecurity').authenticatedUsers.put('token12345', {
        data: {
          id: 42,
          email: 'test@juice-sh.op'
        }
      })
      challenges.forgedFeedbackChallenge = { solved: false, save: save }
    })

    it('should not be solved when an authenticated user passes his own ID when writing feedback', function () {
      req.body.UserId = 42
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.be.false
    })

    it('should not be solved when an authenticated user passes no ID when writing feedback', function () {
      req.body.UserId = undefined
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.be.false
    })

    it('should be solved when an authenticated user passes someone elses ID when writing feedback', function () {
      req.body.UserId = 1
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.be.true
    })

    it('should be solved when an unauthenticated user passes someones ID when writing feedback', function () {
      req.body.UserId = 1
      req.headers = { }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.be.true
    })
  })
})
