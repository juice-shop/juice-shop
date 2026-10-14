/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import config from 'config'
import { challenges, products, setRetrieveBlueprintChallengeFile } from '../../data/datacache'
import type { Product, Challenge } from '@juice-shop/data/types'
import type { Product as ProductConfig } from '../../lib/config.schema'
import * as security from '../../lib/insecurity'
import { type UserModel } from '@juice-shop/models/user'
import * as verify from '../../routes/verify'
import { isWindows } from '../../lib/utils'

void describe('verify', () => {
  let req: any
  let res: any
  let next: any
  let save: any
  let err: any

  beforeEach(() => {
    req = { body: {}, headers: {}, header: mock.fn(() => undefined) }
    res = { json: mock.fn() }
    next = mock.fn()
    save = () => ({
      then () { }
    })
  })

  void describe('"forgedFeedbackChallenge"', () => {
    beforeEach(() => {
      security.authenticatedUsers.put('token12345', {
        data: {
          id: 42,
          email: 'test@juice-sh.op'
        } as unknown as UserModel
      })
      challenges.forgedFeedbackChallenge = { solved: false, save } as unknown as Challenge
    })

    void it('is not solved when an authenticated user passes his own ID when writing feedback', () => {
      req.body.UserId = 42
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      assert.equal(challenges.forgedFeedbackChallenge.solved, false)
    })

    void it('is not solved when an authenticated user passes no ID when writing feedback', () => {
      req.body.UserId = undefined
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      assert.equal(challenges.forgedFeedbackChallenge.solved, false)
    })

    void it('is solved when an authenticated user passes someone elses ID when writing feedback', () => {
      req.body.UserId = 1
      req.headers = { authorization: 'Bearer token12345' }

      verify.forgedFeedbackChallenge()(req, res, next)

      assert.equal(challenges.forgedFeedbackChallenge.solved, true)
    })

    void it('is solved when an unauthenticated user passes someones ID when writing feedback', () => {
      req.body.UserId = 1
      req.headers = {}

      verify.forgedFeedbackChallenge()(req, res, next)

      assert.equal(challenges.forgedFeedbackChallenge.solved, true)
    })
  })

  void describe('accessControlChallenges', () => {
    void it('"scoreBoardChallenge" is solved when the 1px.png transpixel is requested', () => {
      challenges.scoreBoardChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/1px.png'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.scoreBoardChallenge.solved, true)
    })

    void it('"adminSectionChallenge" is solved when the 19px.png transpixel is requested', () => {
      challenges.adminSectionChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/19px.png'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.adminSectionChallenge.solved, true)
    })

    void it('"tokenSaleChallenge" is solved when the 56px.png transpixel is requested', () => {
      challenges.tokenSaleChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/padding/56px.png'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.tokenSaleChallenge.solved, true)
    })

    void it('"extraLanguageChallenge" is solved when the Klingon translation file is requested', () => {
      challenges.extraLanguageChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/i18n/tlh_AA.json'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.extraLanguageChallenge.solved, true)
    })

    void it('"retrieveBlueprintChallenge" is solved when the blueprint file is requested', () => {
      challenges.retrieveBlueprintChallenge = { solved: false, save } as unknown as Challenge
      setRetrieveBlueprintChallengeFile('test.dxf')
      req.url = 'http://juice-sh.op/public/images/products/test.dxf'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.retrieveBlueprintChallenge.solved, true)
    })

    void it('"missingEncodingChallenge" is solved when the crazy cat photo is requested', () => {
      challenges.missingEncodingChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/public/images/uploads/%E1%93%9A%E1%98%8F%E1%97%A2-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.missingEncodingChallenge.solved, true)
    })

    void it('"accessLogDisclosureChallenge" is solved when any server access log file is requested', () => {
      challenges.accessLogDisclosureChallenge = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/support/logs/access.log.2019-01-15'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.accessLogDisclosureChallenge.solved, true)
    })

    void it('"misplacedIacFiles" is solved when a Terraform .tf file under /infrastructure is requested', () => {
      challenges.misplacedIacFiles = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/infrastructure/terraform/main.tf'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.misplacedIacFiles.solved, true)
    })

    void it('"misplacedIacFiles" is solved when a Dockerfile under /infrastructure is requested', () => {
      challenges.misplacedIacFiles = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/infrastructure/Dockerfile'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.misplacedIacFiles.solved, true)
    })

    void it('"misplacedIacFiles" is solved when a docker-compose.yml under /infrastructure is requested', () => {
      challenges.misplacedIacFiles = { solved: false, save } as unknown as Challenge
      req.url = 'http://juice-sh.op/infrastructure/docker-compose.yml'

      verify.accessControlChallenges()(req, res, next)

      assert.equal(challenges.misplacedIacFiles.solved, true)
    })
  })

  void describe('"errorHandlingChallenge"', () => {
    beforeEach(() => {
      challenges.errorHandlingChallenge = { solved: false, save } as unknown as Challenge
    })

    void it('is solved when an error occurs on a response with OK 200 status code', () => {
      res.statusCode = 200
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      assert.equal(challenges.errorHandlingChallenge.solved, true)
    })

    void describe('is solved when an error occurs on a response with error', () => {
      const httpStatus = [402, 403, 404, 500]
      httpStatus.forEach(statusCode => {
        void it(`${statusCode} status code`, () => {
          res.statusCode = statusCode
          err = new Error()

          verify.errorHandlingChallenge()(err, req, res, next)

          assert.equal(challenges.errorHandlingChallenge.solved, true)
        })
      })
    })

    void it('is not solved when no error occurs on a response with OK 200 status code', () => {
      res.statusCode = 200
      err = undefined

      verify.errorHandlingChallenge()(err, req, res, next)

      assert.equal(challenges.errorHandlingChallenge.solved, false)
    })

    void describe('is not solved when no error occurs on a response with error', () => {
      const httpStatus = [401, 402, 404, 500]
      httpStatus.forEach(statusCode => {
        void it(`${statusCode} status code`, () => {
          res.statusCode = statusCode
          err = undefined

          verify.errorHandlingChallenge()(err, req, res, next)

          assert.equal(challenges.errorHandlingChallenge.solved, false)
        })
      })
    })

    void it('should pass occurred error on to next route', () => {
      res.statusCode = 500
      err = new Error()

      verify.errorHandlingChallenge()(err, req, res, next)

      assert.equal(next.mock.calls.length, 1)
      assert.equal(next.mock.calls[0].arguments[0], err)
    })
  })

  void describe('databaseRelatedChallenges', () => {
    void describe('"changeProductChallenge"', () => {
      beforeEach(() => {
        challenges.changeProductChallenge = { solved: false, save } as unknown as Challenge
        products.osaft = { reload () { return { then (cb: any) { cb() } } } } as unknown as Product
      })

      void it(`is solved when the link in the O-Saft product goes to ${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}`, () => {
        products.osaft.description = `O-Saft, yeah! <a href="${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">More...</a>`

        verify.databaseRelatedChallenges()(req, res, next)

        assert.equal(challenges.changeProductChallenge.solved, true)
      })

      void it('is not solved when the link in the O-Saft product is changed to an arbitrary URL', () => {
        products.osaft.description = 'O-Saft, nooo! <a href="http://arbitrary.url" target="_blank">More...</a>'

        verify.databaseRelatedChallenges()(req, res, next)

        assert.equal(challenges.changeProductChallenge.solved, false)
      })

      void it('is not solved when the link in the O-Saft product remained unchanged', () => {
        let urlForProductTamperingChallenge = null
        for (const product of config.get<ProductConfig[]>('products')) {
          if (product.urlForProductTamperingChallenge !== undefined) {
            urlForProductTamperingChallenge = product.urlForProductTamperingChallenge
            break
          }
        }
        products.osaft.description = `Vanilla O-Saft! <a href="${urlForProductTamperingChallenge}" target="_blank">More...</a>`

        verify.databaseRelatedChallenges()(req, res, next)

        assert.equal(challenges.changeProductChallenge.solved, false)
      })
    })
  })

  void describe('jwtChallenges', () => {
    beforeEach(() => {
      challenges.jwtUnsignedChallenge = { solved: false, save } as unknown as Challenge
      challenges.jwtForgedChallenge = { solved: false, save, disabledEnv: 'Windows' } as unknown as Challenge
    })

    void it('"jwtUnsignedChallenge" is solved when forged unsigned token has email jwtn3d@juice-sh.op in the payload', () => {
      req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.' }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtUnsignedChallenge.solved, true)
    })

    void it('"jwtUnsignedChallenge" is solved when forged unsigned token has string "jwtn3d@" in the payload', () => {
      req.headers = { authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQCJ9LCJpYXQiOjE1MDg2Mzk2MTIsImV4cCI6OTk5OTk5OTk5OX0.' }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtUnsignedChallenge.solved, true)
    })

    void it('"jwtUnsignedChallenge" is not solved via regularly signed token even with email jwtn3d@juice-sh.op in the payload', () => {
      const token = security.authorize({ data: { email: 'jwtn3d@juice-sh.op' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtUnsignedChallenge.solved, false)
    })

    void it('"jwtForgedChallenge" is solved when forged token HMAC-signed with public RSA-key has email rsa_lord@juice-sh.op in the payload', { skip: isWindows() ? 'not supported on Windows' : false }, () => {
      req.headers = { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTgyMjIxNTc1fQ.ycFwtqh4ht4Pq9K5rhiPPY256F9YCTIecd4FHFuSEAg' }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtForgedChallenge.solved, true)
    })

    void it('"jwtForgedChallenge" is solved when forged token HMAC-signed with public RSA-key has string "rsa_lord@" in the payload', { skip: isWindows() ? 'not supported on Windows' : false }, () => {
      req.headers = { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAIn0sImlhdCI6MTU4MjIyMTY3NX0.50f6VAIQk2Uzpf3sgH-1JVrrTuwudonm2DKn2ec7Tg8' }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtForgedChallenge.solved, true)
    })

    void it('"jwtForgedChallenge" is not solved when token regularly signed with private RSA-key has email rsa_lord@juice-sh.op in the payload', { skip: isWindows() ? 'not supported on Windows' : false }, () => {
      const token = security.authorize({ data: { email: 'rsa_lord@juice-sh.op' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.jwtForgedChallenge.solved, false)
    })

    void it('"iacLeakedKeyChallenge" is solved when RS256-signed token has email cloud-admin@juice-sh.op in the payload', () => {
      challenges.iacLeakedKeyChallenge = { solved: false, save } as unknown as Challenge
      const token = security.authorize({ data: { email: 'cloud-admin@juice-sh.op' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.iacLeakedKeyChallenge.solved, true)
    })

    void it('"iacLeakedKeyChallenge" is solved when RS256-signed token has string "cloud-admin@" in the payload', () => {
      challenges.iacLeakedKeyChallenge = { solved: false, save } as unknown as Challenge
      const token = security.authorize({ data: { email: 'cloud-admin@' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.iacLeakedKeyChallenge.solved, true)
    })

    void it('"iacLeakedKeyChallenge" is not solved when token has wrong email', () => {
      challenges.iacLeakedKeyChallenge = { solved: false, save } as unknown as Challenge
      const token = security.authorize({ data: { email: 'admin@juice-sh.op' } })
      req.headers = { authorization: `Bearer ${token}` }

      verify.jwtChallenges()(req, res, next)

      assert.equal(challenges.iacLeakedKeyChallenge.solved, false)
    })
  })

  void describe('checkSystemPromptSimilarity', () => {
    void it('should return true if similarity is above threshold', () => {
      const s1 = 'This is a test'
      const s2 = 'This is a test'
      assert.ok(verify.checkSystemPromptSimilarity(s1, s2))
    })

    void it('should return false if similarity is below threshold', () => {
      const s1 = 'This is a test'
      const s2 = 'Something completely different'
      assert.ok(!verify.checkSystemPromptSimilarity(s1, s2, 0.9))
    })
  })
})
