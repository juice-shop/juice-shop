/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
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

  beforeEach(() => {
    this.req = { body: { } }
    this.res = { json: sinon.spy(), status: sinon.spy() }
    this.next = sinon.spy()
    this.save = () => ({
      then () { }
    })
  })

  it('infinite loop payload does not succeed but solves "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: this.save }

    this.req.body.orderLinesData = '(function dos() { while(true); })()'

    createB2bOrder()(this.req, this.res, this.next)

    expect(challenges.rceChallenge.solved).to.equal(true)
  })

  it('timeout after 2 seconds solves "rceOccupyChallenge"', () => {
    challenges.rceOccupyChallenge = { solved: false, save: this.save }

    this.req.body.orderLinesData = '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'

    createB2bOrder()(this.req, this.res, this.next)

    expect(challenges.rceOccupyChallenge.solved).to.equal(true)
  }).timeout(3000)

  it('deserializing JSON as documented in Swagger should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: this.save }

    this.req.body.orderLinesData = '{"productId": 12,"quantity": 10000,"customerReference": ["PO0000001.2", "SM20180105|042"],"couponCode": "pes[Bh.u*t"}'

    createB2bOrder()(this.req, this.res, this.next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing arbitrary JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: this.save }

    this.req.body.orderLinesData = '{"hello": "world", "foo": 42, "bar": [false, true]}'

    createB2bOrder()(this.req, this.res, this.next)
    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing broken JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: this.save }

    this.req.body.orderLinesData = '{ "productId: 28'

    createB2bOrder()(this.req, this.res, this.next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })
})
