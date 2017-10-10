const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')
const http = require('http')

const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/rest/product/:id/reviews', () => {
  const reviewResponseSchema = {
    id: Joi.number(),
    product: Joi.number(),
    message: Joi.string(),
    author: Joi.string()
  }

  it('GET product reviews by product id', done => {
    frisby.get(REST_URL + '/product/1/reviews')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', reviewResponseSchema).done(done)
  })

  it('GET product reviews attack by injecting a mongoDB sleep command', done => {
    frisby.get(REST_URL + '/product/sleep(1)/reviews')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', reviewResponseSchema).done(done)
  })

  it('PUT single product review can be created', done => {
    frisby.put(REST_URL + '/product/1/reviews', {
      body: {
        message: 'Lorem Ipsum',
        author: 'Anonymous'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .done(done)
  })
})

describe('/rest/product/reviews', () => {
  const updatedReviewResponseSchema = {
    modified: Joi.number(),
    original: Joi.array(),
    updated: Joi.array()
  }

  let reviewId

  beforeAll((done) => {
    http.get(REST_URL + '/product/1/reviews', (res) => {
      let body = ''

      res.on('data', chunk => {
        body += chunk
      })

      res.on('end', () => {
        const response = JSON.parse(body)
        reviewId = response.data[0]._id
        done()
      })
    })
  })

  it('PATCH single product review can be edited', done => {
    frisby.patch(REST_URL + '/product/reviews', {
      headers: authHeader,
      body: {
        id: reviewId,
        message: 'Lorem Ipsum'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', updatedReviewResponseSchema)
      .done(done)
  })

  it('PATCH single product review editing need an authenticated user', done => {
    frisby.patch(REST_URL + '/product/reviews', {
      body: {
        id: reviewId,
        message: 'Lorem Ipsum'
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('PATCH multiple product review via injection', done => {
    frisby.patch(REST_URL + '/product/reviews', {
      headers: authHeader,
      body: {
        id: { '$ne': -1 },
        message: 'trololololololololololololololololololololololololololol'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', updatedReviewResponseSchema)
      .expect('json', {
        modified: 6
      }).done(done)
  })
})
