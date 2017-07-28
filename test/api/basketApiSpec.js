const frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

var validCoupon = insecurity.generateCoupon(new Date(), 15)
var outdatedCoupon = insecurity.generateCoupon(new Date(2001, 0, 1), 20)
var forgedCoupon = insecurity.generateCoupon(new Date(), 99)

describe('/rest/basket/:id', function () {
  it('GET existing basket by id is not allowed via public API', function (done) {
    frisby.get(REST_URL + '/basket/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET empty basket when requesting non-existing basket id', function (done) {
    frisby.get(REST_URL + '/basket/4711', {headers: authHeader})
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {})
      .done(done)
  })

  it('GET existing basket with contained products by id', function (done) {
    frisby.get(REST_URL + '/basket/1', {headers: authHeader})
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {id: 1})
      .then(function (res) {
        expect(res.json.data.products.length).toBe(3)
      })
      .done(done)
  })
})

describe('/api/Baskets', function () {
  it('POST new basket is not part of API', function (done) {
    frisby.post(API_URL + '/Baskets', {
      headers: authHeader,
      body: {
        UserId: 1
      }
    })
      .expect('status', 200)
      .expect('json', { status: 'error' })
      .done(done)
  })

  it('GET all baskets is not part of API', function (done) {
    frisby.get(API_URL + '/Baskets', { headers: authHeader })
      .expect('status', 200)
      .expect('json', { status: 'error' })
      .done(done)
  })
})

describe('/api/Baskets/:id', function () {
  it('GET existing basket is not part of API', function (done) {
    frisby.get(API_URL + '/Baskets/1', { headers: authHeader })
      .expect('status', 200)
      .expect('json', { status: 'error' })
      .done(done)
  })

  it('PUT update existing basket is not part of API', function (done) {
    frisby.put(API_URL + '/Baskets/1', {
      headers: authHeader,
      body: { UserId: 2 }
    })
      .expect('status', 200)
      .expect('json', { status: 'error' })
      .done(done)
  })

  it('DELETE existing basket is not part of API', function (done) {
    frisby.del(API_URL + '/Baskets/1', { headers: authHeader })
      .expect('status', 200)
      .expect('json', { status: 'error' })
      .done(done)
  })
})

describe('/rest/basket/:id', function () {
  it('GET existing basket of another user', function (done) {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(function (res) {
        return frisby.get(REST_URL + '/basket/2', { headers: { 'Authorization': 'Bearer ' + res.json.authentication.token } })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .expect('json', 'data', { id: 2 })
      })
      .done(done)
  })
})

describe('/rest/basket/:id/checkout', function () {
  it('POST placing an order for a basket is not allowed via public API', function (done) {
    frisby.post(REST_URL + '/basket/1/checkout')
      .expect('status', 401)
      .done(done)
  })

  it('POST placing an order for an existing basket returns path to an order confirmation PDF', function (done) {
    frisby.post(REST_URL + '/basket/1/checkout', { headers: authHeader })
      .expect('status', 200)
      .then(function (res) {
        expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
      })
      .done(done)
  })

  it('POST placing an order for a non-existing basket fails', function (done) {
    frisby.post(REST_URL + '/basket/42/checkout', { headers: authHeader })
      .expect('status', 500)
      .expect('bodyContains', 'Error: Basket with id=42 does not exist.')
      .done(done)
  })

  it('POST placing an order for a basket with a negative total cost is possible', function (done) {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: { BasketId: 3, ProductId: 10, quantity: -100 }
    })
      .expect('status', 200)
      .then(function () {
        return frisby.post(REST_URL + '/basket/3/checkout', { headers: authHeader })
          .expect('status', 200)
          .then(function (res) {
            expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
          })
      })
      .done(done)
  })

  it('POST placing an order for a basket with 99% discount is possible', function (done) {
    frisby.put(REST_URL + '/basket/2/coupon/' + encodeURIComponent(forgedCoupon), { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {discount: 99})
      .then(function () {
        return frisby.post(REST_URL + '/basket/2/checkout', { headers: authHeader })
          .expect('status', 200)
          .then(function (res) {
            expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
          })
      })
      .done(done)
  })
})

describe('/rest/basket/:id/coupon/:coupon', function () {
  it('PUT apply valid coupon to existing basket', function (done) {
    frisby.put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(validCoupon), { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {discount: 15})
      .done(done)
  })

  xit('PUT apply invalid coupon is not accepted', function (done) {
    frisby.put(REST_URL + '/basket/1/coupon/xxxxxxxxxx', { headers: authHeader })
      .expect('status', 404)
      .done(done)
  })

  it('PUT apply outdated coupon is not accepted', function (done) {
    frisby.put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(outdatedCoupon), { headers: authHeader })
      .expect('status', 404)
      .done(done)
  })

  it('PUT apply valid coupon to non-existing basket throws error', function (done) {
    frisby.put(REST_URL + '/basket/4711/coupon/' + encodeURIComponent(validCoupon), { headers: authHeader })
      .expect('status', 500)
      .done(done)
  })
})
