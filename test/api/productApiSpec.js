const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')
const config = require('config')

const tamperingProductId = ((() => {
  const products = config.get('products')
  for (let i = 0; i < products.length; i++) {
    if (products[i].urlForProductTamperingChallenge) {
      return i + 1
    }
  }
})())

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

describe('/api/Products', () => {
  it('GET all products', done => {
    frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        image: Joi.string()
      }).done(done)
  })

  it('POST new product is forbidden via public API', done => {
    frisby.post(API_URL + '/Products', {
      name: 'Dirt Juice (1000ml)',
      description: 'Made from ugly dirt.',
      price: 0.99,
      image: 'dirt_juice.jpg'
    })
      .expect('status', 401)
      .done(done)
  })

  it('POST new product does not filter XSS attacks', done => {
    frisby.post(API_URL + '/Products', {
      headers: authHeader,
      body: {
        name: 'XSS Juice (42ml)',
        description: '<script>alert("XSS")</script>',
        price: 9999.99,
        image: 'xss3juice.jpg'
      }
    })
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: '<script>alert("XSS")</script>' })
      .done(done)
  })
})

describe('/api/Products/:id', () => {
  it('GET existing product by id', done => {
    frisby.get(API_URL + '/Products/1')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        image: Joi.string(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
      .expect('json', 'data', { id: 1 })
      .done(done)
  })

  it('GET non-existing product by id', done => {
    frisby.get(API_URL + '/Products/4711')
      .expect('status', 404)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'message', 'Not Found')
      .done(done)
  })

  it('PUT update existing product is possible due to Missing Function-Level Access Control vulnerability', done => {
    frisby.put(API_URL + '/Products/' + tamperingProductId, {
      header: jsonHeader,
      body: {
        description: '<a href="http://kimminich.de" target="_blank">More...</a>'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: '<a href="http://kimminich.de" target="_blank">More...</a>' })
      .done(done)
  })

  it('PUT update existing product does not filter XSS attacks', done => {
    frisby.put(API_URL + '/Products/1', {
      header: jsonHeader,
      body: {
        description: "<script>alert('XSS')</script>"
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: "<script>alert('XSS')</script>" })
      .done(done)
  })

  it('DELETE existing product is forbidden via public API', done => {
    frisby.del(API_URL + '/Products/1')
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing product is forbidden via API even when authenticated', done => {
    frisby.del(API_URL + '/Products/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
