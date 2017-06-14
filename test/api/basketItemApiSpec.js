var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('GET all basket items is forbidden via public API')
  .get(API_URL + '/BasketItems')
  .expectStatus(401)
  .toss()

frisby.create('POST new basket item is forbidden via public API')
  .post(API_URL + '/BasketItems', {
    BasketId: 1,
    ProductId: 1,
    quantity: 1
  })
  .expectStatus(401)
  .toss()

frisby.create('GET existing basket item by id is forbidden via public API')
  .get(API_URL + '/BasketItems/1')
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing basket item is forbidden via public API')
  .put(API_URL + '/BasketItems/1', {
    quantity: 2
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing basket item is forbidden via public API')
  .delete(API_URL + '/BasketItems/1')
  .expectStatus(401)
  .toss()

frisby.create('GET all basket items')
  .addHeaders(authHeader)
  .get(API_URL + '/BasketItems')
  .expectStatus(200)
  .toss()

frisby.create('POST new basket item')
  .addHeaders(authHeader)
  .post(API_URL + '/BasketItems', {
    BasketId: 2,
    ProductId: 2,
    quantity: 1
  }, { json: true })
  .expectStatus(200)
  .afterJSON(function (basketItem) {
    frisby.create('GET existing basket item by id')
      .addHeaders(authHeader)
      .get(API_URL + '/BasketItems/' + basketItem.data.id)
      .expectStatus(200)
      .afterJSON(function () {
        frisby.create('PUT update existing basket item')
          .addHeaders(authHeader)
          .put(API_URL + '/BasketItems/' + basketItem.data.id, {
            quantity: 2
          }, { json: true })
          .expectStatus(200)
          .afterJSON(function () {
            frisby.create('DELETE existing basket item')
              .addHeaders(authHeader)
              .delete(API_URL + '/BasketItems/' + +basketItem.data.id)
              .expectStatus(200)
              .toss()
          }).toss()
      }).toss()
  }).toss()
