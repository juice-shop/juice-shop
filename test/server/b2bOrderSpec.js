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
    res = { end: sinon.spy() }
    next = sinon.spy()
  })

  it('deserializing harmless JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{ "harmless": "orderLine1" }', '{ "friendly": "orderLine2" }']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  it('deserializing broken JSON should not solve "rceChallenge"', () => {
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{ "broken: "JSON"']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(false)
  })

  xit('error thrown from deserialization timeout solves "rceChallenge"', () => { // FIXME Make proper wait/sleep of >2sec
    challenges.rceChallenge = { solved: false, save: save }

    req.body.orderLinesData = ['{"rce":"_$$ND_FUNC$$_function (){setTimeout(function() {console.log(\'RCE!\');}, 3000)}()"}']

    createB2bOrder()(req, res, next)

    expect(challenges.rceChallenge.solved).to.equal(true)
  })
})
