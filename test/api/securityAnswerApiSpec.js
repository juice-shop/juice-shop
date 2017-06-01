var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('GET all security answers is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .get(API_URL + '/SecurityAnswers')
  .expectStatus(401)
  .toss()

frisby.create('GET existing security answer by id is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .get(API_URL + '/SecurityAnswers/1')
  .expectStatus(401)
  .toss()

frisby.create('POST new security answer for existing user fails from unique constraint')
  .addHeaders(authHeader)
  .post(API_URL + '/SecurityAnswers', {
    UserId: 1,
    SecurityQuestionId: 1,
    answer: 'Horst'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('message', {
    code: 'SQLITE_CONSTRAINT'
  })
  .toss()

frisby.create('For a newly registered user')
  .post(API_URL + '/Users', {
    email: 'new.user@te.st',
    password: '12345'
  }, { json: true })
  .expectStatus(200)
  .afterJSON(function (user) {
    frisby.create('POST new security answer')
      .addHeaders(authHeader)
      .post(API_URL + '/SecurityAnswers', {
        UserId: user.id,
        SecurityQuestionId: 1,
        answer: 'Horst'
      }, { json: true })
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
      })
      .toss()
  }).toss()

frisby.create('PUT update existing security answer is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .put(API_URL + '/SecurityAnswers/1', {
    answer: 'Blurp'
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing security answer is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .delete(API_URL + '/SecurityAnswers/1')
  .expectStatus(401)
  .toss()
