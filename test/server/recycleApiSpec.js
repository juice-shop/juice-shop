var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('POST new recycle')
  .addHeaders(authHeader)
  .post(API_URL + '/Recycles', {
    quantity: 200,
    address: 'Bjoern Kimminich, 123 Juicy Road, Test City',
    isPickup: true,
    date: '2017-05-31'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    id: Number,
    createdAt: String,
    updatedAt: String
  })
  .afterJSON(function (recycle) {
    frisby.create('GET existing recycle by id is forbidden')
      .addHeaders(authHeader)
      .get(API_URL + '/Recycles/' + recycle.data.id)
      .expectStatus(401)
      .toss()
    frisby.create('PUT update existing recycle is forbidden')
      .addHeaders(authHeader)
      .put(API_URL + '/Recycles/' + recycle.data.id, {
        message: 'Should not work...'
      }, { json: true })
      .expectStatus(401)
      .toss()
    frisby.create('DELETE existing recycle is forbidden')
      .addHeaders(authHeader)
      .delete(API_URL + '/Recycles/' + +recycle.data.id)
      .expectStatus(401)
      .toss()
  }).toss()

frisby.create('GET all recycles')
  .get(API_URL + '/Recycles')
  .expectStatus(200)
  .toss()
