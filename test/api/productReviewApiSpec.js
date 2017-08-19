const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')

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
      .expect('jsonTypes', 'data.*', reviewResponseSchema).done(done)
  })

  it('GET product reviews attack by injecting a mongoDB sleep command', function (done) {
    frisby.get(REST_URL + '/product/sleep(100)/reviews')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', reviewResponseSchema).done(done)
  })

  it('PUT single product review can be created', function (done) {
    frisby.put(REST_URL + '/product/1/reviews', {
      body: {
        message: 'Lorem Ipsum',
        author: 'Anonymous'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', reviewResponseSchema).done(done)
      .expect('json', 'data', {
        message: 'Lorem Ipsum',
        author: 'Anonymous'
      })
  })
})

describe('/rest/product/reviews', function () {
  var updatedReviewResponseSchema = {
    n: Joi.number(),
    nModified: Joi.number(),
    ok: Joi.number()
  }

  it('PATCH single product review can be edited', function (done) {
    frisby.patch(REST_URL + '/product/reviews', {
      headers: authHeader,
      body: {
        id: 1,
        message: 'Lorem Ipsum'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', updatedReviewResponseSchema)
      .expect('json', 'data', {
        n: 1,
        nModified: 1,
        ok: 1
      }).done(done)
  })

  it('PATCH single product review editing need an authenticated user', function (done) {
    frisby.patch(REST_URL + '/product/reviews', {
      body: {
        id: 1,
        message: 'Lorem Ipsum'
      }
    })
      .expect('status', 401)
      .expect('header', 'content-type', /application\/json/)
      .done(done)
  })

  it('PATCH multiple product review via injection', function (done) {
    frisby.patch(REST_URL + '/product/reviews', {
      headers: authHeader,
      body: {
        '$ne': -1
      },
      message: 'trololololololololololololololololololololololololololol'
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', updatedReviewResponseSchema)
      .expect('json', 'data', {
        n: 7,
        nModified: 7,
        ok: 1
      }).done(done)
  })
})
