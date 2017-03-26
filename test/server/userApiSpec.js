var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')
var config = require('config')

var API_URL = 'http://localhost:3000/api'
var REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('POST new user')
  .post(API_URL + '/Users', {
    email: 'horst@horstma.nn',
    password: 'hooooorst'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    id: Number,
    createdAt: String,
    updatedAt: String
  })
  .expectJSON('data', {
    password: insecurity.hash('hooooorst')
  })
  .afterJSON(function (user) {
    frisby.create('POST login existing user')
      .post(REST_URL + '/user/login', {
        email: 'horst@horstma.nn',
        password: 'hooooorst'
      }, { json: true })
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSONTypes({
        token: String,
        umail: String,
        bid: Number
      })
      .afterJSON(function (auth) {
        frisby.create('GET own user id and email on who-am-i request')
          .get(REST_URL + '/user/whoami')
          .addHeaders({ 'Authorization': 'Bearer ' + auth.token })
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSONTypes({
            id: Number
          })
          .expectJSON({
            email: 'horst@horstma.nn'
          })
          .toss()
        frisby.create('GET password change with passing wrong current password')
          .get(REST_URL + '/user/change-password?current=definetely_wrong&new=blubb&repeat=blubb')
          .addHeaders({ 'Cookie': 'token=' + auth.token })
          .expectStatus(401)
          .expectBodyContains('Current password is not correct')
          .toss()
        frisby.create('GET password change with recognized token as cookie')
          .get(REST_URL + '/user/change-password?current=hooooorst&new=foo&repeat=foo')
          .addHeaders({ 'Cookie': 'token=' + auth.token })
          .expectStatus(200)
          .afterJSON(function () {
            frisby.create('GET password change with recognized token as cookie in double-quotes')
              .get(REST_URL + '/user/change-password?current=hooooorst&new=bar&repeat=bar')
              .addHeaders({ 'Cookie': 'token=%22' + auth.token + '%22' })
              .expectStatus(200)
              .toss()
            frisby.create('GET existing basket of another user')
              .addHeaders({ 'Authorization': 'Bearer ' + auth.token })
              .get(REST_URL + '/basket/2')
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('data', {
                id: 2
              })
              .toss()
            frisby.create('POST feedback is associated with current user')
              .addHeaders({ 'Authorization': 'Bearer ' + auth.token })
              .post(API_URL + '/Feedbacks', {
                comment: 'Horst\'s choice award!',
                rating: 5,
                UserId: 4
              }, { json: true })
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('data', {
                UserId: 4
              })
              .toss()
            frisby.create('POST feedback is associated with any passed user id')
              .addHeaders({ 'Authorization': 'Bearer ' + auth.token })
              .post(API_URL + '/Feedbacks', {
                comment: 'Bender\'s choice award!',
                rating: 2,
                UserId: 3
              }, { json: true })
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('data', {
                UserId: 3
              })
              .toss()
          })
          .toss()
      }).toss()

    frisby.create('GET existing user by id')
      .addHeaders(authHeader)
      .get(API_URL + '/Users/' + user.data.id)
      .expectStatus(200)
      .after(function () {
        frisby.create('PUT update existing user is forbidden via API even when authenticated')
          .addHeaders(authHeader)
          .put(API_URL + '/Users/' + user.data.id, {
            email: 'horst.horstmann@horstma.nn'
          })
          .expectStatus(401)
          .after(function () {
            frisby.create('DELETE existing user is forbidden via API even when authenticated')
              .addHeaders(authHeader)
              .delete(API_URL + '/Users/' + +user.data.id)
              .expectStatus(401)
              .toss()
          }).toss()
      }).toss()
  }).toss()

frisby.create('GET all users is forbidden via public API')
  .get(API_URL + '/Users')
  .expectStatus(401)
  .toss()

frisby.create('GET existing user by id is forbidden via public API')
  .get(API_URL + '/Users/1')
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing user is forbidden via public API')
  .put(API_URL + '/Users/1', {
    email: 'administr@t.or'
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing user is forbidden via public API')
  .delete(API_URL + '/Users/1')
  .expectStatus(401)
  .toss()

frisby.create('POST login user Bender')
  .post(REST_URL + '/user/login', {
    email: 'bender@' + config.get('application.domain'),
    password: 'OhG0dPlease1nsertLiquor!'
  }, { json: true })
  .expectStatus(200)
  .afterJSON(function (auth) {
    frisby.create('GET password change without current password using CSRF')
      .get(REST_URL + '/user/change-password?new=slurmCl4ssic&repeat=slurmCl4ssic')
      .addHeaders({ 'Cookie': 'token=' + auth.token })
      .expectStatus(200)
      .toss()
  }).toss()

frisby.create('POST login non-existing user')
  .post(REST_URL + '/user/login', {
    email: 'otto@mei.er',
    password: 'ooootto'
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('POST login without credentials')
  .post(REST_URL + '/user/login', {
    email: undefined,
    password: undefined
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('POST login with admin credentials')
  .post(REST_URL + '/user/login', {
    email: 'admin@' + config.get('application.domain'),
    password: 'admin123'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with support-team credentials')
  .post(REST_URL + '/user/login', {
    email: 'support@' + config.get('application.domain'),
    password: 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login as bjoern.kimminich@googlemail.com with known password')
  .post(REST_URL + '/user/login', {
    email: 'bjoern.kimminich@googlemail.com',
    password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with WHERE-clause disabling SQL injection attack')
  .post(REST_URL + '/user/login', {
    email: '\' or 1=1--',
    password: undefined
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with known email "admin@juice-sh.op" in SQL injection attack')
  .post(REST_URL + '/user/login', {
    email: 'admin@' + config.get('application.domain') + '\'--',
    password: undefined
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with known email "jim@juice-sh.op" in SQL injection attack')
  .post(REST_URL + '/user/login', {
    email: 'jim@' + config.get('application.domain') + '\'--',
    password: undefined
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with known email "bender@juice-sh.op" in SQL injection attack')
  .post(REST_URL + '/user/login', {
    email: 'bender@' + config.get('application.domain') + '\'--',
    password: undefined
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    token: String
  })
  .toss()

frisby.create('POST login with query-breaking SQL Injection attack')
  .post(REST_URL + '/user/login', {
    email: '\';',
    password: undefined
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('GET password change without passing any passwords')
  .get(REST_URL + '/user/change-password')
  .expectStatus(401)
  .expectBodyContains('Password cannot be empty')
  .toss()

frisby.create('GET password change with passing wrong repeated password')
  .get(REST_URL + '/user/change-password?new=foo&repeat=bar')
  .expectStatus(401)
  .expectBodyContains('New and repeated password do not match')
  .toss()

frisby.create('GET password change without passing an authorization token')
  .get(REST_URL + '/user/change-password?new=foo&repeat=foo')
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('Error: Blocked illegal activity')
  .toss()

frisby.create('GET password change with passing unrecognized authorization cookie')
  .get(REST_URL + '/user/change-password?new=foo&repeat=foo')
  .addHeaders({ 'Cookie': 'token=unknown' })
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('Error: Blocked illegal activity')
  .toss()

frisby.create('GET all users')
  .addHeaders(authHeader)
  .get(API_URL + '/Users')
  .expectStatus(200)
  .toss()

frisby.create('GET all users decorated with attribute for authentication token')
  .addHeaders(authHeader)
  .get(REST_URL + '/user/authentication-details')
  .expectStatus(200)
  .expectJSONTypes('data.?', {
    token: String
  }).toss()

frisby.create('POST new user with XSS attack in email address')
  .post(API_URL + '/Users', {
    email: '<script>alert("XSS2")</script>',
    password: 'does.not.matter'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    email: '<script>alert("XSS2")</script>'
  }, { json: true }).toss()

frisby.create('GET who-am-i request returns nothing on missing auth token')
  .get(REST_URL + '/user/whoami')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({})
  .toss()

frisby.create('GET who-am-i request returns nothing on invalid auth token')
  .get(REST_URL + '/user/whoami')
  .addHeaders({ 'Authorization': 'Bearer InvalidAuthToken' })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({})
  .toss()

frisby.create('GET who-am-i request returns nothing on broken auth token')
  .get(REST_URL + '/user/whoami')
  .addHeaders({ 'Authorization': 'BoarBeatsBear' })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({})
  .toss()

frisby.create('POST OAuth login as admin@juice-sh.op with "Remember me" exploit to log in as ciso@' + config.get('application.domain'))
  .post(REST_URL + '/user/login', {
    email: 'admin@' + config.get('application.domain'),
    password: 'admin123',
    oauth: true
  }, { json: true })
  .addHeaders({ 'X-User-Email': 'ciso@' + config.get('application.domain') })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    umail: 'ciso@' + config.get('application.domain')
  })
  .toss()
