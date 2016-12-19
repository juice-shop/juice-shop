var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('POST new feedback')
  .post(API_URL + '/Feedbacks', {
    comment: 'Perfect!',
    rating: 5
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    id: Number,
    createdAt: String,
    updatedAt: String
  })
  .afterJSON(function (feedback) {
    frisby.create('GET existing feedback item by id')
      .addHeaders(authHeader)
      .get(API_URL + '/Feedbacks/' + feedback.data.id)
      .expectStatus(200)
      .afterJSON(function () {
        frisby.create('PUT update existing feedback')
          .addHeaders(authHeader)
          .put(API_URL + '/Feedbacks/' + feedback.data.id, {
            rating: 2
          }, { json: true })
          .expectStatus(200)
          .afterJSON(function () {
            frisby.create('DELETE existing feedback')
              .addHeaders(authHeader)
              .delete(API_URL + '/Feedbacks/' + +feedback.data.id)
              .expectStatus(200)
              .toss()
          }).toss()
      }).toss()
  }).toss()

frisby.create('GET all feedback')
  .get(API_URL + '/Feedbacks')
  .expectStatus(200)
  .toss()

frisby.create('GET existing feedback by id is forbidden via public API')
  .get(API_URL + '/Feedbacks/1')
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing feedback is forbidden via public API')
  .put(API_URL + '/Feedbacks/1', {
    comment: 'This sucks like nothing has ever sucked before',
    rating: 1
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing feedback is forbidden via public API')
  .delete(API_URL + '/Feedbacks/1')
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing feedback')
  .delete(API_URL + '/Feedbacks/1')
  .addHeaders(authHeader)
  .expectStatus(200)
  .toss()

frisby.create('POST sanitizes unsafe HTML from comment')
  .post(API_URL + '/Feedbacks', {
    comment: 'I am a harm<script>steal-cookie</script><img src="csrf-attack"/><iframe src="evil-content"></iframe>less comment.',
    rating: 1
  }, { json: true })
  .expectStatus(200)
  .expectJSON('data', {
    comment: 'I am a harmless comment.'
  })
  .toss()

frisby.create('POST fails to sanitize masked CSRF-attack by not applying sanitization recursively')
  .post(API_URL + '/Feedbacks', {
    comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <<script>alert("XSS4")</script>script>alert("XSS4")<</script>/script>',
    rating: 1
  }, { json: true })
  .expectStatus(200)
  .expectJSON('data', {
    comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <script>alert("XSS4")</script>'
  })
  .toss()

frisby.create('POST feedback in another users name as anonymous user')
  .post(API_URL + '/Feedbacks', {
    comment: 'Lousy crap! You use sequelize 1.7.x? Welcome to SQL Injection-land, morons! As if that is not bad enough, you use z85/base85 and hashids for crypto? Even MD5 to hash passwords! Srsly?!?!',
    rating: 1,
    UserId: 3
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    UserId: 3
  }).toss()

frisby.create('POST feedback in a non-existing users name as anonymous user')
  .post(API_URL + '/Feedbacks', {
    comment: 'When juice fails...',
    rating: 0,
    UserId: 4711
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    UserId: 4711
  }).toss()

frisby.create('POST feedback can be created without supplying data')
  .post(API_URL + '/Feedbacks', {
    comment: undefined
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    comment: undefined,
    rating: undefined,
    UserId: undefined
  }).toss()
