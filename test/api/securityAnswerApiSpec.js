const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/SecurityAnswers', () => {
  it('GET all security answers is forbidden via public API even when authenticated', done => {
    frisby.get(API_URL + '/SecurityAnswers', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('POST new security answer for existing user fails from unique constraint', done => {
    frisby.post(API_URL + '/SecurityAnswers', {
      headers: authHeader,
      body: {
        UserId: 1,
        SecurityQuestionId: 1,
        answer: 'Horst'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'message', {
        code: 'SQLITE_CONSTRAINT'
      })
      .done(done)
  })
})

describe('/api/SecurityAnswers/:id', () => {
  it('GET existing security answer by id is forbidden via public API even when authenticated', done => {
    frisby.get(API_URL + '/SecurityAnswers/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })

  it('POST security answer for a newly registered user', done => {
    frisby.post(API_URL + '/Users', {
      email: 'new.user@te.st',
      password: '12345'
    }, { json: true })
      .expect('status', 200)
      .then(res => frisby.post(API_URL + '/SecurityAnswers', {
        headers: authHeader,
        body: {
          UserId: res.json.id,
          SecurityQuestionId: 1,
          answer: 'Horst'
        }
      })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })).done(done)
  })

  it('PUT update existing security answer is forbidden via public API even when authenticated', done => {
    frisby.put(API_URL + '/SecurityAnswers/1', {
      headers: authHeader,
      body: {
        answer: 'Blurp'
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing security answer is forbidden via public API even when authenticated', done => {
    frisby.del(API_URL + '/SecurityAnswers/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})
