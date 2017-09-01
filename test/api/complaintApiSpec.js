const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/Complaints', () => {
  it('POST new complaint', done => {
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

  it('GET all complaints is forbidden via public API', done => {
    frisby.get(API_URL + '/Complaints')
      .expect('status', 401)
      .done(done)
  })

  it('GET all complaints', done => {
    frisby.get(API_URL + '/Complaints', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })
})

describe('/api/Complaints/:id', () => {
  it('GET existing complaint by id is forbidden', done => {
    frisby.get(API_URL + '/Complaints/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing complaint is forbidden', done => {
    frisby.put(API_URL + '/Complaints/1', {
      headers: authHeader,
      body: {
        message: 'Should not work...'
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing complaint is forbidden', done => {
    frisby.del(API_URL + '/Complaints/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
