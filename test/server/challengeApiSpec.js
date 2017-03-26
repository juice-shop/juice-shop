var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('GET all challenges ')
  .get(API_URL + '/Challenges')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data.*', {
    id: Number,
    name: String,
    description: String,
    difficulty: Number,
    solved: Boolean
  })
  .toss()

frisby.create('GET existing challenge by id is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .get(API_URL + '/Challenges/1')
  .expectStatus(401)
  .toss()

frisby.create('POST new challenge is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .post(API_URL + '/Challenges', {
    name: 'Invulnerability',
    description: 'I am not a vulnerability!',
    difficulty: 3,
    solved: false
  })
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing challenge is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .put(API_URL + '/Challenges/1', {
    name: 'Vulnerability',
    description: 'I am a vulnerability!!!',
    difficulty: 3
  }, { json: true })
  .expectStatus(401)
  .toss()

frisby.create('DELETE existing challenge is forbidden via public API even when authenticated')
  .addHeaders(authHeader)
  .delete(API_URL + '/Challenges/1')
  .expectStatus(401)
  .toss()

frisby.create('GET can retrieve continue code for currently solved challenges')
  .get('http://localhost:3000/rest/continue-code')
  .expectStatus(200)
  .inspectJSON()
  .toss()

frisby.create('PUT invalid continue code is rejected')
  .put('http://localhost:3000/rest/continue-code/apply/ThisIsDefinitelyNotAValidContinueCode')
  .expectStatus(404)
  .toss()

frisby.create('PUT continue code for more than one challenge is accepted') // using [1, 2] here
  .put('http://localhost:3000/rest/continue-code/apply/yXjv6Z5jWJnzD6a3YvmwPRXK7roAyzHDde2Og19yEN84plqxkMBbLVQrDeoY')
  .expectStatus(200)
  .toss()

frisby.create('PUT continue code for non-existent challenge #99 is accepted')
  .put('http://localhost:3000/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkKgGe9M7k2rK63YpqQLPjnlb5V5LvDj')
  .expectStatus(200)
  .toss()
