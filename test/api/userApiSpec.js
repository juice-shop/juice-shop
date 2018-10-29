const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

describe('/api/Users', () => {
  it('GET all users is forbidden via public API', done => {
    frisby.get(API_URL + '/Users')
      .expect('status', 401)
      .done(done)
  })

  it('GET all users', done => {
    frisby.get(API_URL + '/Users', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('POST new user', done => {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'horst@horstma.nn',
        password: 'hooooorst'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
      .expect('json', 'data', {
        password: insecurity.hash('hooooorst')
      })
      .done(done)
  })

  it('POST new user with XSS attack in email address', done => {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: '<iframe src="javascript:alert(`xss`)">',
        password: 'does.not.matter'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { email: '<iframe src="javascript:alert(`xss`)">' })
      .done(done)
  })
})

describe('/api/Users/:id', () => {
  it('GET existing user by id is forbidden via public API', done => {
    frisby.get(API_URL + '/Users/1')
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing user is forbidden via public API', done => {
    frisby.put(API_URL + '/Users/1', {
      header: jsonHeader,
      body: { email: 'administr@t.or' }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing user is forbidden via public API', done => {
    frisby.del(API_URL + '/Users/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET existing user by id', done => {
    frisby.get(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('PUT update existing user is forbidden via API even when authenticated', done => {
    frisby.put(API_URL + '/Users/1', {
      headers: authHeader,
      body: { email: 'horst.horstmann@horstma.nn' }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing user is forbidden via API even when authenticated', done => {
    frisby.del(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})

describe('/rest/user/authentication-details', () => {
  it('GET all users decorated with attribute for authentication token', done => {
    frisby.get(REST_URL + '/user/authentication-details', { headers: authHeader })
      .expect('status', 200)
      .expect('jsonTypes', 'data.?', {
        token: Joi.string()
      }).done(done)
  })

  it('GET all users with password replaced by asterisks', done => {
    frisby.get(REST_URL + '/user/authentication-details', { headers: authHeader })
      .expect('status', 200)
      .expect('json', 'data.?', {
        password: '********************************'
      }).done(done)
  })
})

describe('/rest/user/whoami', () => {
  xit('GET own user id and email on who-am-i request', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(({ json }) => frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer ' + json.authentication.token } })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .expect('jsonTypes', 'user', {
          id: Joi.number()
        })
        .expect('json', 'user', {
          email: 'bjoern.kimminich@googlemail.com'
        }))
      .done(done)
  })

  it('GET who-am-i request returns nothing on missing auth token', done => {
    frisby.get(REST_URL + '/user/whoami')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })

  it('GET who-am-i request returns nothing on invalid auth token', done => {
    frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer InvalidAuthToken' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })

  it('GET who-am-i request returns nothing on broken auth token', done => {
    frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'BoarBeatsBear' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })
})
