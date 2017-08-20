const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/Recycles', function () {
  it('POST new recycle', function (done) {
    frisby.post(API_URL + '/Recycles', {
      headers: authHeader,
      body: {
        quantity: 200,
        address: 'Bjoern Kimminich, 123 Juicy Road, Test City',
        isPickup: true,
        date: '2017-05-31'
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

  it('GET all recycles is forbidden via public API', function (done) {
    frisby.get(API_URL + '/Recycles')
      .expect('status', 401)
      .done(done)
  })

  it('GET all recycles', function (done) {
    frisby.get(API_URL + '/Recycles', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })
})

describe('/api/Recycles/:id', function () {
  it('GET existing recycle by id is forbidden', function (done) {
    frisby.get(API_URL + '/Recycles/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing recycle is forbidden', function (done) {
    frisby.put(API_URL + '/Recycles/1', {
      headers: authHeader,
      body: {
        quantity: 100000
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing recycle is forbidden', function (done) {
    frisby.del(API_URL + '/Recycles/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
