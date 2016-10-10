var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('POST new complaint')
  .addHeaders(authHeader)
  .post(API_URL + '/Complaints', {
    message: 'My stuff never arrived! This is outrageous'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    id: Number,
    createdAt: String,
    updatedAt: String
  })
  .afterJSON(function (complaint) {
    frisby.create('GET existing complaint item by id is forbidden')
      .addHeaders(authHeader)
      .get(API_URL + '/Complaints/' + complaint.data.id)
      .expectStatus(401)
      .toss()
    frisby.create('PUT update existing feedback is forbidden')
      .addHeaders(authHeader)
      .put(API_URL + '/Complaints/' + complaint.data.id, {
        message: 'Should not work...'
      }, { json: true })
      .expectStatus(401)
      .toss()
    frisby.create('DELETE existing feedback is forbidden')
      .addHeaders(authHeader)
      .delete(API_URL + '/Complaints/' + +complaint.data.id)
      .expectStatus(401)
      .toss()
  }).toss()

frisby.create('GET all complaints is forbidden via public API')
  .get(API_URL + '/Complaints')
  .expectStatus(401)
  .toss()
