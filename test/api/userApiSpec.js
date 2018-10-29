const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

describe('/api/Users', () => {
  it('GET all users is forbidden via public API', () => {
    return frisby.get(API_URL + '/Users')
      .expect('status', 401)
  })

  it('GET all users', () => {
    return frisby.get(API_URL + '/Users', { headers: authHeader })
      .expect('status', 200)
  })

  it('POST new user', () => {
    return frisby.post(API_URL + '/Users', {
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
  })

  it('POST new user with XSS attack in email address', () => {
    return frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: '<iframe src="javascript:alert(`xss`)">',
        password: 'does.not.matter'
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { email: '<iframe src="javascript:alert(`xss`)">' })
  })
})

describe('/api/Users/:id', () => {
  it('GET existing user by id is forbidden via public API', () => {
    return frisby.get(API_URL + '/Users/1')
      .expect('status', 401)
  })

  it('PUT update existing user is forbidden via public API', () => {
    return frisby.put(API_URL + '/Users/1', {
      header: jsonHeader,
      body: { email: 'administr@t.or' }
    })
      .expect('status', 401)
  })

  it('DELETE existing user is forbidden via public API', () => {
    return frisby.del(API_URL + '/Users/1')
      .expect('status', 401)
  })

  it('GET existing user by id', () => {
    return frisby.get(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 200)
  })

  it('PUT update existing user is forbidden via API even when authenticated', () => {
    return frisby.put(API_URL + '/Users/1', {
      headers: authHeader,
      body: { email: 'horst.horstmann@horstma.nn' }
    })
      .expect('status', 401)
  })

  it('DELETE existing user is forbidden via API even when authenticated', () => {
    return frisby.del(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 401)
  })
})

describe('/rest/user/authentication-details', () => {
  it('GET all users decorated with attribute for authentication token', () => {
    return frisby.get(REST_URL + '/user/authentication-details', { headers: authHeader })
      .expect('status', 200)
      .expect('jsonTypes', 'data.?', {
        token: Joi.string()
      })
  })

  it('GET all users with password replaced by asterisks', () => {
    return frisby.get(REST_URL + '/user/authentication-details', { headers: authHeader })
      .expect('status', 200)
      .expect('json', 'data.?', {
        password: '********************************'
      })
  })
})

describe('/rest/user/whoami', () => {
  xit('GET own user id and email on who-am-i request', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer ' + json.authentication.token } })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .expect('jsonTypes', 'user', {
            id: Joi.number()
          })
          .expect('json', 'user', {
            email: 'bjoern.kimminich@googlemail.com'
          })
      })
  })

  it('GET who-am-i request returns nothing on missing auth token', () => {
    return frisby.get(REST_URL + '/user/whoami')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
  })

  it('GET who-am-i request returns nothing on invalid auth token', () => {
    return frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer InvalidAuthToken' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
  })

  it('GET who-am-i request returns nothing on broken auth token', () => {
    return frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'BoarBeatsBear' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
  })
})
