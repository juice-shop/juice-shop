/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { challenges } from '../../data/datacache'
import { type Challenge } from 'data/types'
import { b2bOrder } from '../../routes/b2bOrder'
const expect = chai.expect
chai.use(sinonChai)

describe('b2bOrder', () => {
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
    challenges.rceChallenge = { solved: false, save } as unknown as Challenge
  })

  xit('infinite loop payload does not succeed but solves "rceChallenge"', () => { // FIXME Started failing on Linux regularly
    req.body.orderLinesData = '(function dos() { while(true); })()'

    b2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(true)
  })

  // FIXME Disabled as test started failing on Linux regularly
  xit('timeout after 2 seconds solves "rceOccupyChallenge"', () => {
    req.body.orderLinesData = '/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")'

    b2bOrder()(req, res, next)

    expect(challenges.rceOccupyChallenge.solved).to.equal(true)
  }/*, 3000 */)

  it('deserializing JSON as documented in Swagger should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{"productId": 12,"quantity": 10000,"customerReference": ["PO0000001.2", "SM20180105|042"],"couponCode": "pes[Bh.u*t"}'

    b2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing arbitrary JSON should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{"hello": "world", "foo": 42, "bar": [false, true]}'

    b2bOrder()(req, res, next)
    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing broken JSON should not solve "rceChallenge"', () => {
    req.body.orderLinesData = '{ "productId: 28'

    b2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })
})
