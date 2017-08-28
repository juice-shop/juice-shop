const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/Challenges', function () {
  it('GET all challenges', function (done) {
    frisby.get(API_URL + '/Challenges')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        difficulty: Joi.number(),
        solved: Joi.boolean()
      })
      .done(done)
  })

  it('POST new challenge is forbidden via public API even when authenticated', function (done) {
    frisby.post(API_URL + '/Challenges', {
      headers: authHeader,
      body: {
        name: 'Invulnerability',
        description: 'I am not a vulnerability!',
        difficulty: 3,
        solved: false
      }
    })
      .expect('status', 401)
      .done(done)
  })
})

describe('/api/Challenges/:id', function () {
  it('GET existing challenge by id is forbidden via public API even when authenticated', function (done) {
    frisby.get(API_URL + '/Challenges/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing challenge is forbidden via public API even when authenticated', function (done) {
    frisby.put(API_URL + '/Challenges/1', {
      headers: authHeader,
      body: {
        name: 'Vulnerability',
        description: 'I am a vulnerability!!!',
        difficulty: 3
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing challenge is forbidden via public API even when authenticated', function (done) {
    frisby.del(API_URL + '/Challenges/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})

describe('/rest/continue-code', function () {
  it('GET can retrieve continue code for currently solved challenges', function (done) {
    frisby.get(REST_URL + '/continue-code')
      .expect('status', 200)
      .done(done)
  })

  it('PUT invalid continue code is rejected', function (done) {
    frisby.put(REST_URL + '/continue-code/apply/ThisIsDefinitelyNotAValidContinueCode')
      .expect('status', 404)
      .done(done)
  })

  it('PUT continue code for more than one challenge is accepted', function (done) { // using [1, 2] here
    frisby.put(REST_URL + '/continue-code/apply/yXjv6Z5jWJnzD6a3YvmwPRXK7roAyzHDde2Og19yEN84plqxkMBbLVQrDeoY')
      .expect('status', 200)
      .done(done)
  })

  it('PUT continue code for non-existent challenge #99 is accepted', function (done) {
    frisby.put(REST_URL + '/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkKgGe9M7k2rK63YpqQLPjnlb5V5LvDj')
      .expect('status', 200)
      .done(done)
  })
})
