const frisby = require('frisby')
const Joi = frisby.Joi

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/api', () => {
  it('GET all models declared in API', done => {
    frisby.get(API_URL)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        name: Joi.string(),
        tableName: Joi.string()
      })
      .expect('json', 'data.?', {
        name: 'BasketItem',
        tableName: 'BasketItems'
      })
      .expect('json', 'data.?', {
        name: 'Challenge',
        tableName: 'Challenges'
      })
      .expect('json', 'data.?', {
        name: 'Feedback',
        tableName: 'Feedbacks'
      })
      .expect('json', 'data.?', {
        name: 'Product',
        tableName: 'Products'
      })
      .expect('json', 'data.?', {
        name: 'User',
        tableName: 'Users'
      })
      .done(done)
  })
})

describe('/rest', () => {
  it('GET error message with information leakage when calling unrecognized path with /rest in it', done => {
    frisby.get(REST_URL + '/unrecognized')
      .expect('status', 500)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Unexpected path: /rest/unrecognized')
      .done(done)
  })
})
