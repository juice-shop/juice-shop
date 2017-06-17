var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('GET product reviews by product id')
  .get(REST_URL + '/product/1/reviews')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data.*', {
    _id: Number,
    product: Number,
    message: String,
    author: String
  })
  .toss()

frisby.create('GET product reviews attack by injecting a mongoDB sleep command')
  .get(REST_URL + '/product/sleep(100)/reviews')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data.*', {
    _id: Number,
    product: Number,
    message: String,
    author: String
  })
  .toss()

frisby.create('PUT single product review can be created')
  .put(REST_URL + '/product/1/reviews', {
    message: 'Lorem Ipsum',
    author: 'Anonymous'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    _id: Number,
    product: Number,
    message: String,
    author: String
  })
  .expectJSON('data', {
    message: 'Lorem Ipsum',
    author: 'Anonymous'
  })
  .toss()

frisby.create('PATCH single product review can be edited')
  .addHeaders(authHeader)
  .patch(REST_URL + '/product/reviews', {
    id: 1,
    message: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    n: Number,
    nModified: Number,
    ok: Number})
  .expectJSON({
    n: 1,
    nModified: 1,
    ok: 1})
  .toss()

frisby.create('PATCH single product review editing need an authenticated user')
  .patch(REST_URL + '/product/reviews', {
    id: 1,
    message: 'Lorem Ipsum Lorem Ipsum Lorem'
  }, { json: true })
  .expectStatus(401)
  .expectHeaderContains('content-type', 'application/json')

frisby.create('PATCH multiple product review via injection')
  .addHeaders(authHeader)
  .patch(REST_URL + '/product/reviews', {
    id: {
      '$ne': -1
    },
    message: 'trololololololololololololololololololololololololololol'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    n: Number,
    nModified: Number,
    ok: Number})
  .expectJSON({
    n: 7,
    nModified: 7,
    ok: 1})
  .toss()
