const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
// const expect = chai.expect
chai.use(sinonChai)

describe('b2bOrder', () => {
  let createB2bOrder, req, res, next

  beforeEach(() => {
    createB2bOrder = require('../../routes/b2bOrder')
    req = { body: { } }
    res = { end: sinon.spy() }
    next = sinon.spy()
  })

  it('should deserialize all orderLines passed with request', () => {
    req.body.orderLinesData = ['{ "harmless": "orderLine1" }', '{ "friendly": "orderLine2" }']

    createB2bOrder()(req, res, next)
  })
})
