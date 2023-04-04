/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('b2bOrder', () => {
  const createB2bOrder = require('../../routes/b2bOrder')
  const challenges = require('../../data/datacache').challenges
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = { body: { } }
    res = { json: sinon.spy(), status: sinon.spy() }
    next = sinon.spy()
    save = () => ({
      then () { }
    })
  })

  xit('infinite loop payload does not succeed but solves "rceChallenge"', () => { // FIXME Started failing on Linux regularly
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = '(function dos() { while(true); })()'

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(true)
  })

  xit('timeout after 2 seconds solves "rceOccupyChallenge"', () => { // FIXME Started failing on Linux regularly
    challenges.rceOccupyChallenge = { solved: false, save: save }

    req.body.orderLinesData = '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'

    createB2bOrder()(req, res, next)

    expect(challenges.rceOccupyChallenge.solved).to.equal(true)
  }, 3000)

  it('deserializing JSON as documented in Swagger should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = '{"productId": 12,"quantity": 10000,"customerReference": ["PO0000001.2", "SM20180105|042"],"couponCode": "pes[Bh.u*t"}'

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing arbitrary JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = '{"hello": "world", "foo": 42, "bar": [false, true]}'

    createB2bOrder()(req, res, next)
    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing broken JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = '{ "productId: 28'

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })
})
