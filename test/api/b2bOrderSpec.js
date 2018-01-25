const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/b2b/v2/orders'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/b2b/v2/orders', () => {
  it('POST endless loop exploit in "orderLinesData" will raise explicit error', done => {
    frisby.post(API_URL, {
      headers: authHeader,
      body: {
        orderLinesData: ['(function dos() { while(true); })()']
      }
    })
      .expect('status', 500)
      .expect('bodyContains', 'Infinite loop detected - reached max iterations')
      .done(done)
  })

  it('POST busy spinning regex attack does not raise an error', done => {
    frisby.post(API_URL, {
      headers: authHeader,
      body: {
        orderLinesData: ['/((a+)+)b/.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa")']
      }
    })
      .expect('status', 503)
      .done(done)
  })

  it('POST sandbox breakout attack does not kill the server', done => {
    frisby.post(API_URL, {
      headers: authHeader,
      body: {
        orderLinesData: ['this.constructor.constructor("return process")().exit()']
      }
    })
      .expect('status', 200)
      .done(done)
  })

  it('POST new B2B order is forbidden without authorization token', done => {
    frisby.post(API_URL, {})
      .expect('status', 401)
      .done(done)
  })

  it('POST new B2B order accepts arbitrary valid JSON', done => {
    frisby.post(API_URL, {
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
      .done(done)
  })

  it('POST new B2B order has passed "cid" in response', done => {
    frisby.post(API_URL, {
      headers: authHeader,
      body: {
        cid: 'test'
      }
    })
      .expect('status', 200)
      .expect('json', {
        cid: 'test'
      })
      .done(done)
  })
})
