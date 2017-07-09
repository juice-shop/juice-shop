var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')
var config = require('config')

var API_URL = 'http://localhost:3000/api'
var REST_URL = 'http://localhost:3000/rest'

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

frisby.create('GET security question for an existing user\'s email address')
  .get(REST_URL + '/user/security-question?email=jim@' + config.get('application.domain'))
  .expectStatus(200)
  .expectJSON('question', {
    question: 'Your eldest siblings middle name?'
  })
  .toss()

frisby.create('GET security question returns nothing for an unknown email address')
  .get(REST_URL + '/user/security-question?email=horst@unknown-us.er')
  .expectStatus(200)
  .expectJSON({})
  .toss()

frisby.create('GET security question returns nothing for missing email address')
  .get(REST_URL + '/user/security-question')
  .expectStatus(200)
  .expectJSON({})
  .toss()

frisby.create('GET security question is not susceptible to SQL Injection attacks')
  .get(REST_URL + '/user/security-question?email=\';')
  .expectStatus(200)
  .toss()
