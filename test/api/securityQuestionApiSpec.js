var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('GET all security questions ')
  .get(API_URL + '/SecurityQuestions')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data.*', {
    id: Number,
    question: String
  })
  .toss()

frisby.create('GET existing security question by id is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .get(API_URL + '/SecurityQuestions/1')
  .expectStatus(401)
  .toss()

frisby.create('POST new security question is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .post(API_URL + '/SecurityQuestions', {
    question: 'Your own first name?'
  })
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing security question is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .put(API_URL + '/SecurityQuestions/1', {
    question: 'Your own first name?'
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing security question is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .delete(API_URL + '/SecurityQuestions/1')
  .expectStatus(401)
  .toss()
