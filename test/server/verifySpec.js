const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const cache = require('../../data/datacache')
const insecurity = require('../../lib/insecurity')

describe('verify', () => {
  const verify = require('../../routes/verify')
  const challenges = require('../../data/datacache').challenges

  beforeEach(() => {
    this.req = { body: {}, headers: {} }
    this.res = { json: sinon.spy() }
    this.next = sinon.spy()
    this.save = () => ({
      then () { }
    })
  })

  describe('"forgedFeedbackChallenge"', () => {
    beforeEach(() => {
      insecurity.authenticatedUsers.put('token12345', {
        data: {
          id: 42,
          email: 'test@juice-sh.op'
        }
      })
      challenges.forgedFeedbackChallenge = { solved: false, save: this.save }
    })

    it('is not solved when an authenticated user passes his own ID when writing feedback', () => {
      this.req.body.UserId = 42
      this.req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(this.req, this.res, this.next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is not solved when an authenticated user passes no ID when writing feedback', () => {
      this.req.body.UserId = undefined
      this.req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(this.req, this.res, this.next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is solved when an authenticated user passes someone elses ID when writing feedback', () => {
      this.req.body.UserId = 1
      this.req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(this.req, this.res, this.next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })

    it('is solved when an unauthenticated user passes someones ID when writing feedback', () => {
      this.req.body.UserId = 1
      this.req.headers = {}

      verify.forgedFeedbackChallenge()(this.req, this.res, this.next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })
  })

  describe('accessControlChallenges', () => {
    it('"scoreBoardChallenge" is solved when the scoreBoard.png transpixel is this.requested', () => {
      challenges.scoreBoardChallenge = { solved: false, save: this.save }
      this.req.url = 'http://juice-sh.op/public/images/tracking/scoreboard.png'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.scoreBoardChallenge.solved).to.equal(true)
    })

    it('"adminSectionChallenge" is solved when the administration.png transpixel is this.requested', () => {
      challenges.adminSectionChallenge = { solved: false, save: this.save }
      this.req.url = 'http://juice-sh.op/public/images/tracking/administration.png'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.adminSectionChallenge.solved).to.equal(true)
    })

    it('"tokenSaleChallenge" is solved when the tokensale.png transpixel is this.requested', () => {
      challenges.tokenSaleChallenge = { solved: false, save: this.save }
      this.req.url = 'http://juice-sh.op/public/images/tracking/tokensale.png'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.tokenSaleChallenge.solved).to.equal(true)
    })

    it('"geocitiesThemeChallenge" is solved when the microfab.gif image is this.requested', () => {
      challenges.geocitiesThemeChallenge = { solved: false, save: this.save }
      this.req.url = 'http://juice-sh.op/public/images/tracking/microfab.gif'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.geocitiesThemeChallenge.solved).to.equal(true)
    })

    it('"extraLanguageChallenge" is solved when the Klingon translation file is this.requested', () => {
      challenges.extraLanguageChallenge = { solved: false, save: this.save }
      this.req.url = 'http://juice-sh.op/public/i18n/tlh_AA.json'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.extraLanguageChallenge.solved).to.equal(true)
    })

    it('"retrieveBlueprintChallenge" is solved when the blueprint file is this.requested', () => {
      challenges.retrieveBlueprintChallenge = { solved: false, save: this.save }
      cache.retrieveBlueprintChallengeFile = 'test.dxf'
      this.req.url = 'http://juice-sh.op/public/images/products/test.dxf'

      verify.accessControlChallenges()(this.req, this.res, this.next)

      expect(challenges.retrieveBlueprintChallenge.solved).to.equal(true)
    })
  })

  describe('"errorHandlingChallenge"', () => {
    beforeEach(() => {
      challenges.errorHandlingChallenge = { solved: false, save: this.save }
    })

    it('is solved when an error occurs on a this.response with OK 200 status code', () => {
      this.res.statusCode = 200
      this.err = new Error()

      verify.errorHandlingChallenge()(this.err, this.req, this.res, this.next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(true)
    })

    describe('is solved when an error occurs on a this.response with error', () => {
      const httpStatus = [402, 403, 404, 500]
      httpStatus.forEach(statusCode => {
        it(statusCode + ' status code', () => {
          this.res.statusCode = statusCode
          this.err = new Error()

          verify.errorHandlingChallenge()(this.err, this.req, this.res, this.next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(true)
        })
      })
    })

    it('is not solved when no error occurs on a this.response with OK 200 status code', () => {
      this.res.statusCode = 200
      this.err = undefined

      verify.errorHandlingChallenge()(this.err, this.req, this.res, this.next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(false)
    })

    describe('is not solved when no error occurs on a this.response with error', () => {
      const httpStatus = [401, 402, 404, 500]
      httpStatus.forEach(statusCode => {
        it(statusCode + ' status code', () => {
          this.res.statusCode = statusCode
          this.err = undefined

          verify.errorHandlingChallenge()(this.err, this.req, this.res, this.next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(false)
        })
      })
    })

    it('should pass occured error on to this.next route', () => {
      this.res.statusCode = 500
      this.err = new Error()

      verify.errorHandlingChallenge()(this.err, this.req, this.res, this.next)

      expect(this.next).to.have.been.calledWith(this.err)
    })
  })

  describe('databaseRelatedChallenges', () => {
    describe('"changeProductChallenge"', () => {
      const products = require('../../data/datacache').products

      beforeEach(() => {
        challenges.changeProductChallenge = { solved: false, save: this.save }
        products.osaft = { reload () { return { then (cb) { cb() } } } }
      })

      it('is solved when the link in the O-Saft product goes to http://kimminich.de', () => {
        products.osaft.description = 'O-Saft, yeah! <a href="http://kimminich.de" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(this.req, this.res, this.next)

        expect(challenges.changeProductChallenge.solved).to.equal(true)
      })

      it('is not solved when the link in the O-Saft product is changed to an arbitrary URL', () => {
        products.osaft.description = 'O-Saft, nooo! <a href="http://arbitrary.url" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(this.req, this.res, this.next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })

      it('is not solved when the link in the O-Saft product remained unchanged', () => {
        products.osaft.description = 'Vanilla O-Saft! <a href="https://www.owasp.org/index.php/O-Saft" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(this.req, this.res, this.next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })
    })
  })

  describe('jwtChallenges', () => {
    beforeEach(() => {
      challenges.jwtTier1Challenge = { solved: false, save: this.save }
      challenges.jwtTier2Challenge = { solved: false, save: this.save }
    })

    it('"jwtTier1Challenge" is solved when forged unsigned token has email jwtn3d@juice-sh.op in the payload', () => {
      /*
      Header: { "alg": "none", "typ": "JWT" }
      Payload: { "data": { "email": "jwtn3d@juice-sh.op" }, "iat": 1508639612, "exp": 9999999999 }
       */
      this.req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.' }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier1Challenge.solved).to.equal(true)
    })

    it('"jwtTier1Challenge" is solved when forged unsigned token has string "jwtn3d@" in the payload', () => {
      /*
      Header: { "alg": "none", "typ": "JWT" }
      Payload: { "data": { "email": "jwtn3d@" }, "iat": 1508639612, "exp": 9999999999 }
       */
      this.req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQCJ9LCJpYXQiOjE1MDg2Mzk2MTIsImV4cCI6OTk5OTk5OTk5OX0.' }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier1Challenge.solved).to.equal(true)
    })

    it('"jwtTier1Challenge" is not solved via regularly signed token even with email jwtn3d@juice-sh.op in the payload', () => {
      const token = insecurity.authorize({ data: { email: 'jwtn3d@juice-sh.op' } })
      this.req.headers = { authorization: 'Bearer ' + token }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier2Challenge.solved).to.equal(false)
    })

    it('"jwtTier2Challenge" is solved when forged token HMAC-signed with public RSA-key has email rsa_lord@juice-sh.op in the payload', () => {
      /*
      Header: { "alg": "HS256", "typ": "JWT" }
      Payload: { "data": { "email": "rsa_lord@juice-sh.op" }, "iat": 1508639612, "exp": 9999999999 }
       */
      this.req.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTA4NjM5NjEyLCJleHAiOjk5OTk5OTk5OTl9.dFeqI0EGsOecwi5Eo06dFUBtW5ziRljFgMWOCYeA8yw' }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier2Challenge.solved).to.equal(true)
    })

    it('"jwtTier2Challenge" is solved when forged token HMAC-signed with public RSA-key has string "rsa_lord@" in the payload', () => {
      /*
      Header: { "alg": "HS256", "typ": "JWT" }
      Payload: { "data": { "email": "rsa_lord@" }, "iat": 1508639612, "exp": 9999999999 }
       */
      this.req.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.mvgAeQum5lh6Wq4f-69OqLy3g_SD2_aNahyHBHP4Bwk' }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier2Challenge.solved).to.equal(true)
    })

    it('"jwtTier2Challenge" is not solved when token regularly signed with private RSA-key has email rsa_lord@juice-sh.op in the payload', () => {
      const token = insecurity.authorize({ data: { email: 'rsa_lord@juice-sh.op' } })
      this.req.headers = { authorization: 'Bearer ' + token }

      verify.jwtChallenges()(this.req, this.res, this.next)

      expect(challenges.jwtTier2Challenge.solved).to.equal(false)
    })
  })
})
