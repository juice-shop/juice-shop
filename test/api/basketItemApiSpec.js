const frisby = require('frisby')
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/BasketItems', () => {
  it('GET all basket items is forbidden via public API', () => {
    return frisby.get(API_URL + '/BasketItems')
      .expect('status', 401)
  })

  it('POST new basket item is forbidden via public API', () => {
    return frisby.post(API_URL + '/BasketItems', {
      BasketId: 1,
      ProductId: 1,
      quantity: 1
    })
      .expect('status', 401)
  })

  it('GET all basket items', () => {
    return frisby.get(API_URL + '/BasketItems', { headers: authHeader })
      .expect('status', 200)
  })

  it('POST new basket item', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 2,
        quantity: 1
      }
    })
      .expect('status', 200)
  })
})

describe('/api/BasketItems/:id', () => {
  it('GET basket item by id is forbidden via public API', () => {
    return frisby.get(API_URL + '/BasketItems/1')
      .expect('status', 401)
  })

  it('PUT update basket item is forbidden via public API', () => {
    return frisby.put(API_URL + '/BasketItems/1', {
      quantity: 2
    }, { json: true })
      .expect('status', 401)
  })

  it('DELETE basket item is forbidden via public API', () => {
    return frisby.del(API_URL + '/BasketItems/1')
      .expect('status', 401)
  })

  it('GET newly created basket item by id', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 2,
        quantity: 3
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/BasketItems/' + json.data.id, { headers: authHeader })
          .expect('status', 200)
      })
  })

  it('PUT update newly created basket item', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 3,
        quantity: 3
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/BasketItems/' + json.data.id, {
          headers: authHeader,
          body: {
            quantity: 20
          }
        })
          .expect('status', 200)
          .expect('json', 'data', { quantity: 20 })
      })
  })

  it('PUT update basket ID of basket item is forbidden', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 8,
        quantity: 8
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/BasketItems/' + json.data.id, {
          headers: authHeader,
          body: {
            BasketId: 42
          }
        })
          .expect('status', 500)
          .expect('json', { message: 'internal error', errors: ['sequelize.ValidationErrorItem is not a constructor'] })
      })
  })

  it('PUT update product ID of basket item is forbidden', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 9,
        quantity: 9
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/BasketItems/' + json.data.id, {
          headers: authHeader,
          body: {
            ProductId: 42
          }
        })
          .expect('status', 500)
          .expect('json', { message: 'internal error', errors: ['sequelize.ValidationErrorItem is not a constructor'] })
      })
  })

  it('DELETE newly created basket item', () => {
    return frisby.post(API_URL + '/BasketItems', {
      headers: authHeader,
      body: {
        BasketId: 3,
        ProductId: 10,
        quantity: 10
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.del(API_URL + '/BasketItems/' + json.data.id, { headers: authHeader })
          .expect('status', 200)
      })
  })
})
