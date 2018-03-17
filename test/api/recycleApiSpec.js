const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/Recycles', () => {
  it('POST new recycle', done => {
    frisby.post(API_URL + '/Recycles', {
      headers: authHeader,
      body: {
        quantity: 200,
        address: 'Bjoern Kimminich, 123 Juicy Road, Test City',
        isPickup: true,
        date: '2017-05-31'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
      .done(done)
  })

  it('GET all recycles is forbidden via public API', done => {
    frisby.get(API_URL + '/Recycles')
      .expect('status', 401)
      .done(done)
  })

  it('GET all recycles', done => {
    frisby.get(API_URL + '/Recycles', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })
})

describe('/api/Recycles/:id', () => {
  it('GET existing recycle by id is forbidden', done => {
    frisby.get(API_URL + '/Recycles/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing recycle is forbidden', done => {
    frisby.put(API_URL + '/Recycles/1', {
      headers: authHeader,
      body: {
        quantity: 100000
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing recycle is forbidden', done => {
    frisby.del(API_URL + '/Recycles/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
