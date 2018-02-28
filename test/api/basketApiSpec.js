const frisby = require('frisby')
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

const validCoupon = insecurity.generateCoupon(15)
const outdatedCoupon = insecurity.generateCoupon(20, new Date(2001, 0, 1))
const forgedCoupon = insecurity.generateCoupon(99)

describe('/rest/basket/:id', () => {
  it('GET existing basket by id is not allowed via public API', done => {
    frisby.get(REST_URL + '/basket/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET empty basket when requesting non-existing basket id', done => {
    frisby.get(REST_URL + '/basket/4711', {headers: authHeader})
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {})
      .done(done)
  })

  it('GET existing basket with contained products by id', done => {
    frisby.get(REST_URL + '/basket/1', {headers: authHeader})
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {id: 1})
      .then(res => {
        expect(res.json.data.Products.length).toBe(3)
      })
      .done(done)
  })
})

describe('/api/Baskets', () => {
  it('POST new basket is not part of API', done => {
    frisby.post(API_URL + '/Baskets', {
      headers: authHeader,
      body: {
        UserId: 1
      }
    })
      .expect('status', 500)
      .done(done)
  })

  it('GET all baskets is not part of API', done => {
    frisby.get(API_URL + '/Baskets', { headers: authHeader })
      .expect('status', 500)
      .done(done)
  })
})

describe('/api/Baskets/:id', () => {
  it('GET existing basket is not part of API', done => {
    frisby.get(API_URL + '/Baskets/1', { headers: authHeader })
      .expect('status', 500)
      .done(done)
  })

  it('PUT update existing basket is not part of API', done => {
    frisby.put(API_URL + '/Baskets/1', {
      headers: authHeader,
      body: { UserId: 2 }
    })
      .expect('status', 500)
      .done(done)
  })

  it('DELETE existing basket is not part of API', done => {
    frisby.del(API_URL + '/Baskets/1', { headers: authHeader })
      .expect('status', 500)
      .done(done)
  })
})

describe('/rest/basket/:id', () => {
  it('GET existing basket of another user', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(res => frisby.get(REST_URL + '/basket/2', { headers: { 'Authorization': 'Bearer ' + res.json.authentication.token } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { id: 2 }))
      .done(done)
  })
})

describe('/rest/basket/:id/checkout', () => {
  it('POST placing an order for a basket is not allowed via public API', done => {
    frisby.post(REST_URL + '/basket/1/checkout')
      .expect('status', 401)
      .done(done)
  })

  it('POST placing an order for an existing basket returns path to an order confirmation PDF', done => {
    frisby.post(REST_URL + '/basket/1/checkout', { headers: authHeader })
      .expect('status', 200)
      .then(res => {
        expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
      })
      .done(done)
  })

  it('POST placing an order for a non-existing basket fails', done => {
    frisby.post(REST_URL + '/basket/42/checkout', { headers: authHeader })
      .expect('status', 500)
      .expect('bodyContains', 'Error: Basket with id=42 does not exist.')
      .done(done)
  })

  it('POST placing an order for a basket with a negative total cost is possible', done => {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: { BasketId: 3, ProductId: 10, quantity: -100 }
    })
      .expect('status', 201)
      .then(() => frisby.post(REST_URL + '/basket/3/checkout', { headers: authHeader })
      .expect('status', 200)
      .then(res => {
        expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
      }))
      .done(done)
  })

  it('POST placing an order for a basket with 99% discount is possible', done => {
    frisby.put(REST_URL + '/basket/2/coupon/' + encodeURIComponent(forgedCoupon), { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {discount: 99})
      .then(() => frisby.post(REST_URL + '/basket/2/checkout', { headers: authHeader })
      .expect('status', 200)
      .then(res => {
        expect(res.json.orderConfirmation).toMatch(/\/ftp\/order_.*\.pdf/)
      }))
      .done(done)
  })
})

describe('/rest/basket/:id/coupon/:coupon', () => {
  it('PUT apply valid coupon to existing basket', done => {
    frisby.put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(validCoupon), { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {discount: 15})
      .done(done)
  })

  it('PUT apply invalid coupon is not accepted', done => {
    frisby.put(REST_URL + '/basket/1/coupon/xxxxxxxxxx', { headers: authHeader })
      .expect('status', 404)
      .done(done)
  })

  it('PUT apply outdated coupon is not accepted', done => {
    frisby.put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(outdatedCoupon), { headers: authHeader })
      .expect('status', 404)
      .done(done)
  })

  it('PUT apply valid coupon to non-existing basket throws error', done => {
    frisby.put(REST_URL + '/basket/4711/coupon/' + encodeURIComponent(validCoupon), { headers: authHeader })
      .expect('status', 500)
      .done(done)
  })
})
