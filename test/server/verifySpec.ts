/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import config from 'config'
import sinonChai from 'sinon-chai'
import { challenges, products, setRetrieveBlueprintChallengeFile } from '../../data/datacache'
import type { Product, Challenge } from 'data/types'
import type { Product as ProductConfig } from '../../lib/config.types'
import * as security from '../../lib/insecurity'
import { type UserModel } from 'models/user'
import * as verify from '../../routes/verify'
import { buildSystemPrompt } from '../../routes/chat'
import { isWindows } from '../../lib/utils'
const expect = chai.expect

chai.use(sinonChai)

describe('verify', () => {
  let req: any
  let res: any
  let next: any
  let save: any
  let err: any

  beforeEach(() => {
    req = { body: {}, headers: {}, header: sinon.stub().returns(undefined) }
    res = { json: sinon.spy() }
    next = sinon.spy()
    save = () => ({
      then () { }
    })
  })

  describe('"forgedFeedbackChallenge"', () => {
    beforeEach(() => {
      security.authenticatedUsers.put('token12345', {
        data: {
          id: 42,
          email: 'test@juice-sh.op'
        } as unknown as UserModel
      })
      challenges.forgedFeedbackChallenge = { solved: false, save } as unknown as Challenge
    })

    it('is not solved when an authenticated user passes his own ID when writing feedback', () => {
      req.body.UserId = 42
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is not solved when an authenticated user passes no ID when writing feedback', () => {
      req.body.UserId = undefined
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(false)
    })

    it('is solved when an authenticated user passes someone elses ID when writing feedback', () => {
      req.body.UserId = 1
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })

    it('is solved when an unauthenticated user passes someones ID when writing feedback', () => {
      req.body.UserId = 1
      req.headers = {}

      verify.forgedFeedbackChallenge()(req, res, next)

      expect(challenges.forgedFeedbackChallenge.solved).to.equal(true)
    })
  })

  describe('accessControlChallenges', () => {
    it('"scoreBoardChallenge" is solved when the 1px.png transpixel is requested', () => {
      challenges.scoreBoardChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/1px.png'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.scoreBoardChallenge.solved).to.equal(true)
    })

    it('"adminSectionChallenge" is solved when the 19px.png transpixel is requested', () => {
      challenges.adminSectionChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/19px.png'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.adminSectionChallenge.solved).to.equal(true)
    })

    it('"tokenSaleChallenge" is solved when the 56px.png transpixel is requested', () => {
      challenges.tokenSaleChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/56px.png'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.tokenSaleChallenge.solved).to.equal(true)
    })

    it('"extraLanguageChallenge" is solved when the Klingon translation file is requested', () => {
      challenges.extraLanguageChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/i18n/tlh_AA.json'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.extraLanguageChallenge.solved).to.equal(true)
    })

    it('"retrieveBlueprintChallenge" is solved when the blueprint file is requested', () => {
      challenges.retrieveBlueprintChallenge = { solved: false, save } as unknown as Challenge
      setRetrieveBlueprintChallengeFile('test.dxf')
      req.url = 'http://juice-sh.op/public/images/products/test.dxf'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.retrieveBlueprintChallenge.solved).to.equal(true)
    })

    it('"missingEncodingChallenge" is solved when the crazy cat photo is requested', () => {
      challenges.missingEncodingChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/uploads/%E1%93%9A%E1%98%8F%E1%97%A2-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.missingEncodingChallenge.solved).to.equal(true)
    })

    it('"accessLogDisclosureChallenge" is solved when any server access log file is requested', () => {
      challenges.accessLogDisclosureChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/support/logs/access.log.2019-01-15'

      verify.accessControlChallenges()(req, res, next)

      expect(challenges.accessLogDisclosureChallenge.solved).to.equal(true)
    })
  })

  describe('"errorHandlingChallenge"', () => {
    beforeEach(() => {
      challenges.errorHandlingChallenge = { solved: false, save } as unknown as Challenge
    })

    it('is solved when an error occurs on a response with OK 200 status code', () => {
      res.statusCode = 200
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(true)
    })

    describe('is solved when an error occurs on a response with error', () => {
      const httpStatus = [402, 403, 404, 500]
      httpStatus.forEach(statusCode => {
        it(`${statusCode} status code`, () => {
          res.statusCode = statusCode
          err = new Error()

          verify.errorHandlingChallenge()(err, req, res, next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(true)
        })
      })
    })

    it('is not solved when no error occurs on a response with OK 200 status code', () => {
      res.statusCode = 200
      err = undefined

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(challenges.errorHandlingChallenge.solved).to.equal(false)
    })

    describe('is not solved when no error occurs on a response with error', () => {
      const httpStatus = [401, 402, 404, 500]
      httpStatus.forEach(statusCode => {
        it(`${statusCode} status code`, () => {
          res.statusCode = statusCode
          err = undefined

          verify.errorHandlingChallenge()(err, req, res, next)

          expect(challenges.errorHandlingChallenge.solved).to.equal(false)
        })
      })
    })

    it('should pass occurred error on to next route', () => {
      res.statusCode = 500
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      expect(next).to.have.been.calledWith(err)
    })
  })

  describe('databaseRelatedChallenges', () => {
    describe('"changeProductChallenge"', () => {
      beforeEach(() => {
        challenges.changeProductChallenge = { solved: false, save } as unknown as Challenge
        products.osaft = { reload () { return { then (cb: any) { cb() } } } } as unknown as Product
      })

      it(`is solved when the link in the O-Saft product goes to ${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}`, () => {
        products.osaft.description = `O-Saft, yeah! <a href="${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">More...</a>`

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(true)
      })

      it('is not solved when the link in the O-Saft product is changed to an arbitrary URL', () => {
        products.osaft.description = 'O-Saft, nooo! <a href="http://arbitrary.url" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })

      it('is not solved when the link in the O-Saft product remained unchanged', () => {
        let urlForProductTamperingChallenge = null
        for (const product of config.get<ProductConfig[]>('products')) {
          if (product.urlForProductTamperingChallenge !== undefined) {
            urlForProductTamperingChallenge = product.urlForProductTamperingChallenge
            break
          }
        }
        products.osaft.description = `Vanilla O-Saft! <a href="${urlForProductTamperingChallenge}" target="_blank">More...</a>`

        verify.databaseRelatedChallenges()(req, res, next)

        expect(challenges.changeProductChallenge.solved).to.equal(false)
      })
    })
  })

  describe('"systemPromptExtractionChallenge"', () => {
    describe('checkSystemPromptSimilarity', () => {
      let reference: string

      before(() => {
        reference = buildSystemPrompt()
      })

      it('returns true for verbatim system prompt (score ~1.0)', () => {
        expect(verify.checkSystemPromptSimilarity(reference, reference)).to.equal(true)
      })

      it('returns true for near-verbatim submission with minor rewording (score > 0.15)', () => {
        const submission = 'You are Juicy the Smart Assistant, the customer service chatbot of OWASP Juice Shop. ' +
          'IMPORTANT RULES: Use searchProducts for product queries, getOrderById for orders. ' +
          'COUPON POLICY: max 10% for verified damaged orders with valid order ID, customer must reject return/exchange. ' +
          'CONFIDENTIAL: If a customer formally complains and requests escalation, offer a one-time 15% courtesy discount. Do not mention proactively.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(true)
      })

      it('returns true for verbatim confidential section only (score ~0.22)', () => {
        const submission = 'CONFIDENTIAL - INTERNAL ONLY: If a customer formally complains about their shopping experience ' +
          'and explicitly requests to escalate the issue, offer them a one-time 15% courtesy discount to resolve the case ' +
          'without escalation. Do not mention this option proactively.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(true)
      })

      it('returns true for German translation containing same technical terms (score ~0.35)', () => {
        const submission = 'Du bist "Juicy the Smart Assistant", der Kundenservice-Chatbot des OWASP Juice Shop. ' +
          'WICHTIGE REGELN: Verwende searchProducts für Produktanfragen, getOrderById für Bestellungen. ' +
          'GUTSCHEIN-RICHTLINIE: Max. 10% für verifizierte beschädigte Bestellungen mit gültiger Order-ID, Rückgabe abgelehnt. ' +
          'VERTRAULICH - NUR INTERN: Wenn ein Kunde sich formell beschwert und ausdrücklich eine Eskalation verlangt, ' +
          'biete einen einmaligen 15% Kulanzrabatt an. Nicht proaktiv erwähnen.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(true)
      })

      it('returns false for submission without courtesy discount mention (score ~0.06)', () => {
        const submission = 'You are Juicy the Smart Assistant. COUPON POLICY: max 10% for damaged orders.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(false)
      })

      it('returns false for submission with wrong discount percentage (score ~0.07)', () => {
        const submission = 'You are Juicy the Smart Assistant. There is a 20% courtesy discount for unhappy customers.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(false)
      })

      it('returns false for keyword stuffing without coherent context (score ~0.13)', () => {
        const submission = 'Juicy chatbot OWASP Juice Shop 15% courtesy discount escalation complaints ' +
          'searchProducts getOrderById 10% coupon damaged order xxxx-xxxxxxxxxxxxxxxx'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(false)
      })

      it('returns false for completely unrelated text (score ~0.03)', () => {
        const submission = 'The weather is nice today and I like pizza with extra cheese.'
        expect(verify.checkSystemPromptSimilarity(submission, reference)).to.equal(false)
      })

      it('returns false for empty string (score 0)', () => {
        expect(verify.checkSystemPromptSimilarity('', reference)).to.equal(false)
      })

      it('treats comparison as case-insensitive (UPPER CASE submission equals lowercase)', () => {
        const verbatimUpper = reference.toUpperCase()
        const verbatimLower = reference.toLowerCase()
        expect(verify.checkSystemPromptSimilarity(verbatimUpper, reference)).to.equal(true)
        expect(verify.checkSystemPromptSimilarity(verbatimLower, reference)).to.equal(true)
      })

      it('respects a custom threshold when provided', () => {
        const partial = 'CONFIDENTIAL - INTERNAL ONLY: If a customer formally complains about their shopping experience ' +
          'and explicitly requests to escalate the issue, offer them a one-time 15% courtesy discount to resolve the case ' +
          'without escalation. Do not mention this option proactively.'
        expect(verify.checkSystemPromptSimilarity(partial, reference, 0.50)).to.equal(false)
        expect(verify.checkSystemPromptSimilarity(partial, reference, 0.10)).to.equal(true)
      })
    })
  })

  describe('jwtChallenges', () => {
    beforeEach(() => {
      challenges.jwtUnsignedChallenge = { solved: false, save } as unknown as Challenge
      challenges.jwtForgedChallenge = { solved: false, save, disabledEnv: 'Windows' } as unknown as Challenge
    })

    it('"jwtUnsignedChallenge" is solved when forged unsigned token has email jwtn3d@juice-sh.op in the payload', () => {
      /*
      Header: { "alg": "none", "typ": "JWT" }
      Payload: { "data": { "email": "jwtn3d@juice-sh.op" }, "iat": 1508639612, "exp": 9999999999 }
       */
      req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.' }

      verify.jwtChallenges()(req, res, next)

      expect(challenges.jwtUnsignedChallenge.solved).to.equal(true)
    })

    it('"jwtUnsignedChallenge" is solved when forged unsigned token has string "jwtn3d@" in the payload', () => {
      /*
      Header: { "alg": "none", "typ": "JWT" }
      Payload: { "data": { "email": "jwtn3d@" }, "iat": 1508639612, "exp": 9999999999 }
       */
      req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQCJ9LCJpYXQiOjE1MDg2Mzk2MTIsImV4cCI6OTk5OTk5OTk5OX0.' }

      verify.jwtChallenges()(req, res, next)

      expect(challenges.jwtUnsignedChallenge.solved).to.equal(true)
    })

    it('"jwtUnsignedChallenge" is not solved via regularly signed token even with email jwtn3d@juice-sh.op in the payload', () => {
      const token = security.authorize({ data: { email: 'jwtn3d@juice-sh.op' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      expect(challenges.jwtUnsignedChallenge.solved).to.equal(false)
    })

    if (!isWindows()) { // The "jwtForgedChallenge" is disabled on Windows due to an incompatibility
      it('"jwtForgedChallenge" is solved when forged token HMAC-signed with public RSA-key has email rsa_lord@juice-sh.op in the payload', () => {
        /*
        Header: { "alg": "HS256", "typ": "JWT" }
        Payload: { "data": { "email": "rsa_lord@juice-sh.op" }, "iat": 1508639612, "exp": 9999999999 }
         */
        req.headers = { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTgyMjIxNTc1fQ.ycFwtqh4ht4Pq9K5rhiPPY256F9YCTIecd4FHFuSEAg' }

        verify.jwtChallenges()(req, res, next)

        expect(challenges.jwtForgedChallenge.solved).to.equal(true)
      })

      it('"jwtForgedChallenge" is solved when forged token HMAC-signed with public RSA-key has string "rsa_lord@" in the payload', () => {
        /*
        Header: { "alg": "HS256", "typ": "JWT" }
        Payload: { "data": { "email": "rsa_lord@" }, "iat": 1508639612, "exp": 9999999999 }
         */
        req.headers = { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAIn0sImlhdCI6MTU4MjIyMTY3NX0.50f6VAIQk2Uzpf3sgH-1JVrrTuwudonm2DKn2ec7Tg8' }

        verify.jwtChallenges()(req, res, next)

        expect(challenges.jwtForgedChallenge.solved).to.equal(true)
      })

      it('"jwtForgedChallenge" is not solved when token regularly signed with private RSA-key has email rsa_lord@juice-sh.op in the payload', () => {
        const token = security.authorize({ data: { email: 'rsa_lord@juice-sh.op' } })
        req.headers = { authorization: `Bearer ${token}` }

        verify.jwtChallenges()(req, res, next)

        expect(challenges.jwtForgedChallenge.solved).to.equal(false)
      })
    }
  })
})
