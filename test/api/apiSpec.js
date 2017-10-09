const frisby = require('frisby')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/api', () => {
  it('GET error when query /api without actual resource', done => {
    frisby.get(API_URL)
      .expect('status', 500)
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
