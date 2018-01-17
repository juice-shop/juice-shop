const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('b2bOrder', () => {
  let createB2bOrder, challenges, req, res, next
  const save = () => ({
    then: function () { }
  })

  beforeEach(() => {
    createB2bOrder = require('../../routes/b2bOrder')
    challenges = require('../../data/datacache').challenges
    req = { body: { } }
    res = { json: sinon.spy() }
    next = sinon.spy()
  })

  it('error thrown from deserialization timeout solves "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['(function dos() { while(true); })()']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(true)
  }).timeout(3000)

  it('deserializing JSON as documented in Swagger should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{"productId": 12,"quantity": 10000,"customerReference": ["PO0000001.2", "SM20180105|042"],"couponCode": "pes[Bh.u*t"}']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing arbitrary JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{"hello": "world", "foo": 42, "bar": [false, true]}']

    createB2bOrder()(req, res, next)
    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing broken JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{ "productId: 28']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })
})
