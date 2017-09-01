const frisby = require('frisby')
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/BasketItems', () => {
  it('GET all basket items is forbidden via public API', done => {
    frisby.get(API_URL + '/BasketItems')
      .expect('status', 401)
      .done(done)
  })

  it('POST new basket item is forbidden via public API', done => {
    frisby.post(API_URL + '/BasketItems', {
      BasketId: 1,
      ProductId: 1,
      quantity: 1
    })
      .expect('status', 401)
      .done(done)
  })

  it('GET all basket items', done => {
    frisby.get(API_URL + '/BasketItems', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('POST new basket item', done => {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 2,
        quantity: 1
      }
    })
      .expect('status', 200)
      .done(done)
  })
})

describe('/api/BasketItems/:id', () => {
  it('GET basket item by id is forbidden via public API', done => {
    frisby.get(API_URL + '/BasketItems/1')
      .expect('status', 401)
      .done(done)
  })

  it('PUT update basket item is forbidden via public API', done => {
    frisby.put(API_URL + '/BasketItems/1', {
      quantity: 2
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE basket item is forbidden via public API', done => {
    frisby.del(API_URL + '/BasketItems/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET newly created basket item by id', done => {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 2,
        quantity: 3
      }
    })
      .expect('status', 200)
      .then(res => frisby.get(API_URL + '/BasketItems/' + res.json.data.id, { headers: authHeader })
      .expect('status', 200))
      .done(done)
  })

  it('PUT update newly created basket item', done => {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 3,
        quantity: 4
      }
    })
      .expect('status', 200)
      .then(res => frisby.put(API_URL + '/BasketItems/' + res.json.data.id, {
        headers: authHeader,
        body: {
          quantity: 20
        }
      })
      .expect('status', 200)
      .expect('json', 'data', { quantity: 20 }))
      .done(done)
  })

  it('DELETE newly created basket item', done => {
    frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 4,
        quantity: 5
      }
    })
      .expect('status', 200)
      .then(res => frisby.del(API_URL + '/BasketItems/' + res.json.data.id, { headers: authHeader })
      .expect('status', 200))
      .done(done)
  })
})
