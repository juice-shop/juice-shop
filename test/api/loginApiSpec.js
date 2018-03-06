const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')
const config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const customHeader = { 'X-User-Email': 'ciso@' + config.get('application.domain'), 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
const jsonHeader = { 'content-type': 'application/json' }

describe('/rest/user/login', () => {
  it('POST login newly created user', done => {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kalli@kasper.le',
        password: 'kallliiii'
      }
    })
      .expect('status', 201)
      .then(() => frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'kalli@kasper.le',
          password: 'kallliiii'
        }
      })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .expect('jsonTypes', 'authentication', {
          token: Joi.string(),
          umail: Joi.string(),
          bid: Joi.number()
        }))
      .done(done)
  })

  it('POST login non-existing user', done => {
    frisby.post(REST_URL + '/user/login', {
      email: 'otto@mei.er',
      password: 'ooootto'
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })

  it('POST login without credentials', done => {
    frisby.post(REST_URL + '/user/login', {
      email: undefined,
      password: undefined
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })

  it('POST login with admin credentials', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with support-team credentials', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'support@' + config.get('application.domain'),
        password: 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with MC SafeSearch credentials', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'mc.safesearch@' + config.get('application.domain'),
        password: 'Mr. N00dles'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login as bjoern.kimminich@googlemail.com with known password', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with WHERE-clause disabling SQL injection attack', done => {
    frisby.post(REST_URL + '/user/login', {
      header: jsonHeader,
      body: {
        email: '\' or 1=1--',
        password: undefined
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with known email "admin@juice-sh.op" in SQL injection attack', done => {
    frisby.post(REST_URL + '/user/login', {
      header: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain') + '\'--',
        password: undefined
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with known email "jim@juice-sh.op" in SQL injection attack', done => {
    frisby.post(REST_URL + '/user/login', {
      header: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain') + '\'--',
        password: undefined
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with known email "bender@juice-sh.op" in SQL injection attack', done => {
    frisby.post(REST_URL + '/user/login', {
      header: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain') + '\'--',
        password: undefined
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string()
      })
      .done(done)
  })

  it('POST login with query-breaking SQL Injection attack', done => {
    frisby.post(REST_URL + '/user/login', {
      header: jsonHeader,
      body: {
        email: '\';',
        password: undefined
      }
    })
      .expect('status', 401)
      .done(done)
  })

  it('POST OAuth login as admin@juice-sh.op with "Remember me" exploit to log in as ciso@' + config.get('application.domain'), done => {
    frisby.post(REST_URL + '/user/login', {
      headers: customHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123',
        oauth: true
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'authentication', { umail: 'ciso@' + config.get('application.domain') })
      .done(done)
  })
})
