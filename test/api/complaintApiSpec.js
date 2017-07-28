const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/Complaints', function () {
  it('POST new complaint', function (done) {
    frisby.post(API_URL + '/Complaints', {
      headers: authHeader,
      body: {
        message: 'My stuff never arrived! This is outrageous!'
      }
    })
    .expect('status', 200)
    .expect('header', 'content-type', /application\/json/)
    .expect('jsonTypes', 'data', {
      id: Joi.number(),
      createdAt: Joi.string(),
      updatedAt: Joi.string()
    })
      .done(done)
  })

  it('GET all complaints is forbidden via public API', function (done) {
    frisby.get(API_URL + '/Complaints')
      .expect('status', 401)
      .done(done)
  })

  it('GET all complaints', function (done) {
    frisby.get(API_URL + '/Complaints', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })
})

describe('/api/Complaints/:id', function () {
  it('GET existing complaint by id is forbidden', function (done) {
    frisby.get(API_URL + '/Complaints/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing complaint is forbidden', function (done) {
    frisby.put(API_URL + '/Complaints/1', {
      headers: authHeader,
      body: {
        message: 'Should not work...'
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing complaint is forbidden', function (done) {
    frisby.del(API_URL + '/Complaints/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
