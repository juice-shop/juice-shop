/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { challenges } from '../../data/datacache'
import frisby = require('frisby')
const Joi = frisby.Joi
const utils = require('../../lib/utils')
const security = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/b2b/v2/orders'

const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': 'application/json' }

describe('/b2b/v2/orders', () => {
  if (utils.isChallengeEnabled(challenges.rceChallenge) || utils.isChallengeEnabled(challenges.rceOccupyChallenge)) {
    it('POST endless loop exploit in "orderLinesData" will raise explicit error', () => {
      return frisby.post(API_URL, {
        headers: authHeader,
        body: {
          orderLinesData: '(function dos() { while(true); })()'
        }
      })
        .expect('status', 500)
        .expect('bodyContains', 'Infinite loop detected - reached max iterations')
    })

    it('POST busy spinning regex attack does not raise an error', () => {
      return frisby.post(API_URL, {
        headers: authHeader,
        body: {
          orderLinesData: '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'
        }
      })
        .expect('status', 503)
    })

    it('POST sandbox breakout attack in "orderLinesData" will raise error', () => {
      return frisby.post(API_URL, {
        headers: authHeader,
        body: {
          orderLinesData: 'this.constructor.constructor("return process")().exit()'
        }
      })
        .expect('status', 500)
    })
  }

  it('POST new B2B order is forbidden without authorization token', () => {
    return frisby.post(API_URL, {})
      .expect('status', 401)
  })

  it('POST new B2B order accepts arbitrary valid JSON', () => {
    return frisby.post(API_URL, {
      headers: authHeader,
      body: {
        foo: 'bar',
        test: 42
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        cid: Joi.string(),
        orderNo: Joi.string(),
        paymentDue: Joi.string()
      })
  })

  it('POST new B2B order has passed "cid" in response', () => {
    return frisby.post(API_URL, {
      headers: authHeader,
      body: {
        cid: 'test'
      }
    })
      .expect('status', 200)
      .expect('json', {
        cid: 'test'
      })
  })
})
