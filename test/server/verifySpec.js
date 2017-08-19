var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var cache = require('../../data/datacache')

describe('verify', function () {
  var verify = require('../../routes/verify')
  var challenges, req, res, next, err
  var save = function () { return {success: function () {}} }

  beforeEach(function () {
    challenges = require('../../data/datacache').challenges
    req = { body: {}, headers: {} }
    res = { json: sinon.spy() }
    next = sinon.spy()
  })

  describe('"forgedFeedbackChallenge"', function () {
    beforeEach(function () {
      require('../../lib/insecurity').authenticatedUsers.put('token12345', {
        data: {
          id: 42,
          email: 'test@juice-sh.op'
        }
      })
      challenges.forgedFeedbackChallenge = { solved: false, save: save }
    })

    it('is not solved when an authenticated user passes his own ID when writing feedback', function () {
      req.body.UserId = 42
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is not solved when an authenticated user passes no ID when writing feedback', function () {
      req.body.UserId = undefined
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is solved when an authenticated user passes someone elses ID when writing feedback', function () {
      req.body.UserId = 1
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })

    it('is solved when an unauthenticated user passes someones ID when writing feedback', function () {
      req.body.UserId = 1
      req.headers = { }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })
  })

  describe('accessControlChallenges', function () {
    it('"scoreBoardChallenge" is solved when the scoreBoard.png transpixel is requested', function () {
      challenges.scoreBoardChallenge = { solved: false, save: save }
      req.url = 'http://juice-sh.op/public/images/tracking/scoreboard.png'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.scoreBoardChallenge.solved).to.equal(true)
    })

    it('"adminSectionChallenge" is solved when the administration.png transpixel is requested', function () {
      challenges.adminSectionChallenge = { solved: false, save: save }
      req.url = 'http://juice-sh.op/public/images/tracking/administration.png'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.adminSectionChallenge.solved).to.equal(true)
    })

    it('"geocitiesThemeChallenge" is solved when the microfab.gif image is requested', function () {
      challenges.geocitiesThemeChallenge = { solved: false, save: save }
      req.url = 'http://juice-sh.op/public/images/tracking/microfab.gif'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.geocitiesThemeChallenge.solved).to.equal(true)
    })

    it('"extraLanguageChallenge" is solved when the Klingon translation file is requested', function () {
      challenges.extraLanguageChallenge = { solved: false, save: save }
      req.url = 'http://juice-sh.op/public/i18n/tlh.json'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.extraLanguageChallenge.solved).to.equal(true)
    })

    it('"retrieveBlueprintChallenge" is solved when the blueprint file is requested', function () {
      challenges.retrieveBlueprintChallenge = { solved: false, save: save }
      cache.retrieveBlueprintChallengeFile = 'test.dxf'
      req.url = 'http://juice-sh.op/public/images/products/test.dxf'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.retrieveBlueprintChallenge.solved).to.equal(true)
    })
  })

  describe('"errorHandlingChallenge"', function () {
    beforeEach(function () {
      challenges.errorHandlingChallenge = { solved: false, save: save }
    })

    it('is solved when an error occurs on a response with OK 200 status code', function () {
      res.statusCode = 200
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(true)
    })

    describe('is solved when an error occurs on a response with error', function () {
      const httpStatus = [402, 403, 404, 500]
      httpStatus.forEach(function (statusCode) {
        it(statusCode + ' status code', function () {
          res.statusCode = statusCode
          err = new Error()

          verify.errorHandlingChallenge()(err, req, res, next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(true)
        })
      })
    })

    it('is not solved when no error occurs on a response with OK 200 status code', function () {
      res.statusCode = 200
      err = undefined

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(false)
    })

    describe('is not solved when no error occurs on a response with error', function () {
      const httpStatus = [401, 402, 404, 500]
      httpStatus.forEach(function (statusCode) {
        it(statusCode + ' status code', function () {
          res.statusCode = statusCode
          err = undefined

          verify.errorHandlingChallenge()(err, req, res, next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(false)
        })
      })
    })

    it('should pass occured error on to next route', function () {
      res.statusCode = 500
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(next).to.have.been.calledWith(err)
    })
  })

  describe('databaseRelatedChallenges', function () {
    describe('"changeProductChallenge"', function () {
      var products

      beforeEach(function () {
        challenges.changeProductChallenge = { solved: false, save: save }
        products = require('../../data/datacache').products
        products.osaft = { reload: function () { return { success: function (cb) { cb() } } } }
      })

      it('is solved when the link in the O-Saft product goes to http://kimminich.de', function () {
        products.osaft.description = 'O-Saft, yeah! <a href="http://kimminich.de" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(true)
      })

      it('is not solved when the link in the O-Saft product is changed to an arbitrary URL', function () {
        products.osaft.description = 'O-Saft, nooo! <a href="http://arbitrary.url" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })

      it('is not solved when the link in the O-Saft product remained unchanged', function () {
        products.osaft.description = 'Vanilla O-Saft! <a href="https://www.owasp.org/index.php/O-Saft" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })
    })
  })
})
