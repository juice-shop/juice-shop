const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')
const config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { Authorization: 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }

describe('/api/SecurityQuestions', () => {
  it('GET all security questions ', () => {
    return frisby.get(API_URL + '/SecurityQuestions')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        question: Joi.string()
      })
  })

  it('POST new security question is forbidden via public API even when authenticated', () => {
    return frisby.post(API_URL + '/SecurityQuestions', {
      headers: authHeader,
      body: {
        question: 'Your own first name?'
      }
    })
      .expect('status', 401)
  })
})

describe('/api/SecurityQuestions/:id', () => {
  it('GET existing security question by id is forbidden via public API even when authenticated', () => {
    return frisby.get(API_URL + '/SecurityQuestions/1', { headers: authHeader })
      .expect('status', 401)
  })

  it('PUT update existing security question is forbidden via public API even when authenticated', () => {
    return frisby.put(API_URL + '/SecurityQuestions/1', {
      headers: authHeader,
      body: {
        question: 'Your own first name?'
      }
    })
      .expect('status', 401)
  })

  it('DELETE existing security question is forbidden via public API even when authenticated', () => {
    return frisby.del(API_URL + '/SecurityQuestions/1', { headers: authHeader })
      .expect('status', 401)
  })
})

describe('/rest/user/security-question', () => {
  it('GET security question for an existing user\'s email address', () => {
    return frisby.get(REST_URL + '/user/security-question?email=jim@' + config.get('application.domain'))
      .expect('status', 200)
      .expect('json', 'question', {
        question: 'Your eldest siblings middle name?'
      })
  })

  it('GET security question returns nothing for an unknown email address', () => {
    return frisby.get(REST_URL + '/user/security-question?email=horst@unknown-us.er')
      .expect('status', 200)
      .expect('json', {})
  })

  it('GET security question throws error for missing email address', () => {
    return frisby.get(REST_URL + '/user/security-question')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'Error: WHERE parameter &quot;email&quot; has invalid &quot;undefined&quot; value')
  })

  it('GET security question is not susceptible to SQL Injection attacks', () => {
    return frisby.get(REST_URL + '/user/security-question?email=\';')
      .expect('status', 200)
  })
})
