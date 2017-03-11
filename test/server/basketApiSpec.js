var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'
var REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

var validCoupon = insecurity.generateCoupon(new Date(), 15)
var outdatedCoupon = insecurity.generateCoupon(new Date(2001, 0, 1), 20)
var forgedCoupon = insecurity.generateCoupon(new Date(), 99)

frisby.create('GET existing basket by id is not allowed via public API')
  .get(REST_URL + '/basket/1')
  .expectStatus(401)
  .toss()

frisby.create('GET non-existing basket by id')
  .addHeaders(authHeader)
  .get(REST_URL + '/basket/4711')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {})
  .toss()

frisby.create('GET existing basket by id with contained products')
  .addHeaders(authHeader)
  .get(REST_URL + '/basket/1')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    id: 1
  })
  .expectJSONLength('data.products', 3)
  .toss()

frisby.create('POST new basket is not part of API')
  .addHeaders(authHeader)
  .post(API_URL + '/Baskets', {
    UserId: 1
  })
  .expectStatus(200)
  .expectJSON({ status: 'error' })
  .toss()

frisby.create('GET all baskets is not part of API')
  .addHeaders(authHeader)
  .get(API_URL + '/Baskets')
  .expectStatus(200)
  .expectJSON({ status: 'error' })
  .toss()

frisby.create('GET existing basket is not part of API')
  .addHeaders(authHeader)
  .get(API_URL + '/Baskets/1')
  .expectStatus(200)
  .expectJSON({ status: 'error' })
  .toss()

frisby.create('PUT update existing basket is not part of API')
  .addHeaders(authHeader)
  .put(API_URL + '/Baskets/1', {
    UserId: 2
  }, { json: true })
  .expectStatus(200)
  .expectJSON({ status: 'error' })
  .toss()

frisby.create('DELETE existing basket is not part of API')
  .addHeaders(authHeader)
  .delete(API_URL + '/Baskets/1')
  .expectStatus(200)
  .expectJSON({ status: 'error' })
  .toss()

frisby.create('POST placing an order for a basket is not allowed via public API')
  .post(REST_URL + '/basket/1/checkout')
  .expectStatus(401)
  .toss()

frisby.create('POST placing an order for a basket returns URL to confirmation PDF')
  .post(REST_URL + '/basket/1/checkout')
  .addHeaders(authHeader)
  .expectStatus(200)
  .expectBodyContains('/ftp/order_')
  .expectBodyContains('.pdf')
  .toss()

frisby.create('POST placing an order for a non-existing basket')
  .post(REST_URL + '/basket/42/checkout')
  .addHeaders(authHeader)
  .expectStatus(500)
  .expectBodyContains('Error: Basket with id=42 does not exist.')
  .toss()

frisby.create('POST new basket item with negative quantity')
  .addHeaders(authHeader)
  .post(API_URL + '/BasketItems', {
    BasketId: 3,
    ProductId: 9,
    quantity: -100
  }, { json: true })
  .expectStatus(200)
  .after(function () {
    frisby.create('POST placing an order for a basket with a negative total cost')
      .post(REST_URL + '/basket/3/checkout')
      .addHeaders(authHeader)
      .expectStatus(200)
      .expectBodyContains('/ftp/order_')
      .expectBodyContains('.pdf')
      .toss()
  }).toss()

frisby.create('PUT forged coupon with 99% discount')
  .addHeaders(authHeader)
  .put(REST_URL + '/basket/2/coupon/' + encodeURIComponent(forgedCoupon))
  .expectStatus(200)
  .after(function () {
    frisby.create('POST placing an order for a basket with 99% discount')
      .post(REST_URL + '/basket/2/checkout')
      .addHeaders(authHeader)
      .expectStatus(200)
      .expectBodyContains('/ftp/order_')
      .expectBodyContains('.pdf')
      .toss()
  }).toss()

frisby.create('PUT apply invalid coupon')
  .addHeaders(authHeader)
  .put(REST_URL + '/basket/1/coupon/xxxxxxxxxx')
  .expectStatus(404)
  .toss()

frisby.create('PUT apply outdated coupon')
  .addHeaders(authHeader)
  .put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(outdatedCoupon))
  .expectStatus(404)
  .toss()

frisby.create('PUT apply valid coupon to non-existing basket')
  .addHeaders(authHeader)
  .put(REST_URL + '/basket/4711/coupon/' + encodeURIComponent(validCoupon))
  .expectStatus(500)
  .toss()

frisby.create('PUT apply valid coupon to existing basket')
  .addHeaders(authHeader)
  .put(REST_URL + '/basket/1/coupon/' + encodeURIComponent(validCoupon))
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({ discount: 15 })
  .toss()
