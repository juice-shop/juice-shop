const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')
const http = require('http')

const REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/rest/product/:id/reviews', function () {
  var reviewResponseSchema = {
    id: Joi.number(),
    product: Joi.number(),
    message: Joi.string(),
    author: Joi.string()
  }

  it('GET product reviews by product id', function (done) {
    frisby.get(REST_URL + '/product/1/reviews')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', reviewResponseSchema).done(done)
  })

  it('GET product reviews attack by injecting a mongoDB sleep command', function (done) {
    frisby.get(REST_URL + '/product/sleep(1)/reviews')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', reviewResponseSchema).done(done)
  })

  it('PUT single product review can be created', function (done) {
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

describe('/rest/product/reviews', function () {
  const updatedReviewResponseSchema = {
    modified: Joi.number(),
    original: Joi.array(),
    updated: Joi.array()
  }

  let reviewId

  beforeAll((done) => {
    http.get(REST_URL + '/product/1/reviews', (res) => {
      let body = ''

      res.on('data', function (chunk) {
        body += chunk
      })

      res.on('end', function () {
        const response = JSON.parse(body)
        reviewId = response.data[0]._id
        done()
      })
    })
  })

  it('PATCH single product review can be edited', function (done) {
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

  it('PATCH single product review editing need an authenticated user', function (done) {
    frisby.patch(REST_URL + '/product/reviews', {
      body: {
        id: reviewId,
        message: 'Lorem Ipsum'
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('PATCH multiple product review via injection', function (done) {
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
