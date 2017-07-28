const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')
var config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

var customHeader = { 'X-User-Email': 'ciso@' + config.get('application.domain'), 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
var jsonHeader = { 'content-type': 'application/json' }

describe('/api/Users', function () {
  it('GET all users is forbidden via public API', function (done) {
    frisby.get(API_URL + '/Users')
      .expect('status', 401)
      .done(done)
  })

  it('GET all users', function (done) {
    frisby.get(API_URL + '/Users', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('POST new user', function (done) {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'horst@horstma.nn',
        password: 'hooooorst'
      }
    })
      .expect('status', 200)
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

  it('POST new user with XSS attack in email address', function (done) {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: '<script>alert("XSS2")</script>',
        password: 'does.not.matter'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { email: '<script>alert("XSS2")</script>' })
      .done(done)
  })
})

describe('/api/Users/:id', function () {
  it('GET existing user by id is forbidden via public API', function (done) {
    frisby.get(API_URL + '/Users/1')
      .expect('status', 401)
      .done(done)
  })

  it('PUT update existing user is forbidden via public API', function (done) {
    frisby.put(API_URL + '/Users/1', {
      header: jsonHeader,
      body: { email: 'administr@t.or' }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing user is forbidden via public API', function (done) {
    frisby.del(API_URL + '/Users/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET existing user by id', function (done) {
    frisby.get(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('PUT update existing user is forbidden via API even when authenticated', function (done) {
    frisby.put(API_URL + '/Users/1', {
      headers: authHeader,
      body: { email: 'horst.horstmann@horstma.nn' }
    })
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing user is forbidden via API even when authenticated', function (done) {
    frisby.del(API_URL + '/Users/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})

describe('/rest/user/authentication-details', function () {
  it('GET all users decorated with attribute for authentication token', function (done) {
    frisby.get(REST_URL + '/user/authentication-details', { headers: authHeader })
      .expect('status', 200)
      .expect('jsonTypes', 'data.?', {
        token: Joi.string()
      }).done(done)
  })
})

describe('/rest/user/whoami', function () {
  it('GET own user id and email on who-am-i request', function (done) {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(function (res) {
        return frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer ' + res.json.authentication.token } })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .expect('jsonTypes', 'user', {
            id: Joi.number()
          })
          .expect('json', 'user', {
            email: 'bjoern.kimminich@googlemail.com'
          })
      })
      .done(done)
  })

  it('GET who-am-i request returns nothing on missing auth token', function (done) {
    frisby.get(REST_URL + '/user/whoami')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })

  it('GET who-am-i request returns nothing on invalid auth token', function (done) {
    frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'Bearer InvalidAuthToken' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })

  it('GET who-am-i request returns nothing on broken auth token', function (done) {
    frisby.get(REST_URL + '/user/whoami', { headers: { 'Authorization': 'BoarBeatsBear' } })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {})
      .done(done)
  })
})

describe('/rest/user/login', function () {
  it('POST login newly created user', function (done) {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kalli@kasper.le',
        password: 'kallliiii'
      }
    })
      .expect('status', 200)
      .then(function () {
        return frisby.post(REST_URL + '/user/login', {
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
          })
      })
      .done(done)
  })

  it('POST login non-existing user', function (done) {
    frisby.post(REST_URL + '/user/login', {
      email: 'otto@mei.er',
      password: 'ooootto'
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })

  it('POST login without credentials', function (done) {
    frisby.post(REST_URL + '/user/login', {
      email: undefined,
      password: undefined
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })

  it('POST login with admin credentials', function (done) {
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

  it('POST login with support-team credentials', function (done) {
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

  it('POST login as bjoern.kimminich@googlemail.com with known password', function (done) {
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

  it('POST login with WHERE-clause disabling SQL injection attack', function (done) {
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

  it('POST login with known email "admin@juice-sh.op" in SQL injection attack', function (done) {
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

  it('POST login with known email "jim@juice-sh.op" in SQL injection attack', function (done) {
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

  it('POST login with known email "bender@juice-sh.op" in SQL injection attack', function (done) {
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

  it('POST login with query-breaking SQL Injection attack', function (done) {
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

  it('POST OAuth login as admin@juice-sh.op with "Remember me" exploit to log in as ciso@' + config.get('application.domain'), function (done) {
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

describe('/rest/user/change-password', function () {
  it('GET password change for newly created user with recognized token as cookie', function (done) {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kuni@be.rt',
        password: 'kunigunde'
      }
    })
      .expect('status', 200)
      .then(function () {
        return frisby.post(REST_URL + '/user/login', {
          headers: jsonHeader,
          body: {
            email: 'kuni@be.rt',
            password: 'kunigunde'
          }
        })
          .expect('status', 200)
          .then(function (res) {
            return frisby.get(REST_URL + '/user/change-password?current=kunigunde&new=foo&repeat=foo', {
              headers: { 'Cookie': 'token=' + res.json.authentication.token }
            })
              .expect('status', 200)
          })
      })
      .done(done)
  })

  it('GET password change for newly created user with recognized token as cookie in double-quotes', function (done) {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kuni@gun.de',
        password: 'kunibert'
      }
    })
      .expect('status', 200)
      .then(function () {
        return frisby.post(REST_URL + '/user/login', {
          headers: jsonHeader,
          body: {
            email: 'kuni@gun.de',
            password: 'kunibert'
          }
        })
          .expect('status', 200)
          .then(function (res) {
            return frisby.get(REST_URL + '/user/change-password?current=kunibert&new=foo&repeat=foo', {
              headers: { 'Cookie': 'token=%22' + res.json.authentication.token + '%22' }
            })
              .expect('status', 200)
          })
      })
      .done(done)
  })

  it('GET password change with passing wrong current password', function (done) {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(function (res) {
        return frisby.get(REST_URL + '/user/change-password?current=definetely_wrong&new=blubb&repeat=blubb', {
          headers: { 'Cookie': 'token=' + res.json.authentication.token }
        })
          .expect('status', 401)
          .expect('bodyContains', 'Current password is not correct')
      })
      .done(done)
  })

  it('GET password change without passing any passwords', function (done) {
    frisby.get(REST_URL + '/user/change-password')
      .expect('status', 401)
      .expect('bodyContains', 'Password cannot be empty')
      .done(done)
  })

  it('GET password change with passing wrong repeated password', function (done) {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=bar')
      .expect('status', 401)
      .expect('bodyContains', 'New and repeated password do not match')
      .done(done)
  })

  it('GET password change without passing an authorization token', function (done) {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=foo')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('GET password change with passing unrecognized authorization cookie', function (done) {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=foo', { headers: { 'Cookie': 'token=unknown' } })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('GET password change for Bender without current password using CSRF', function (done) {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain'),
        password: 'OhG0dPlease1nsertLiquor!'
      }
    })
      .expect('status', 200)
      .then(function (res) {
        return frisby.get(REST_URL + '/user/change-password?new=slurmCl4ssic&repeat=slurmCl4ssic', {
          headers: { 'Cookie': 'token=' + res.json.authentication.token }
        })
          .expect('status', 200)
      }).done(done)
  })
})

describe('/rest/user/reset-password', function () {
  // TODO Implement missing tests for password reset
  xit('POST password reset for newly created user', function (done) {})

  xit('POST password reset for Jim with correct answer to his security question', function (done) {})

  xit('POST password reset for Bender with correct answer to his security question', function (done) {})

  xit('POST password reset for Bjoern with correct answer to his security question', function (done) {})

  xit('POST password reset with wrong answer to security question', function (done) {})

  it('POST password reset without any data throws a 401 error', function (done) {
    frisby.post(REST_URL + '/user/reset-password')
      .expect('status', 401)
      .done(done)
  })

  it('POST password reset without new password throws a 401 error', function (done) {
    frisby.post(REST_URL + '/user/reset-password', {
      repeat: '12345'
    }, { json: true })
      .expect('status', 401)
      .expect('bodyContains', 'Password cannot be empty.')
      .done(done)
  })

  it('POST password reset with mismatching passwords throws a 401 error', function (done) {
    frisby.post(REST_URL + '/user/reset-password', {
      new: '12345',
      repeat: '1234_'
    }, { json: true })
      .expect('status', 401)
      .expect('bodyContains', 'New and repeated password do not match.')
      .done(done)
  })

  it('POST password reset with mismatching passwords throws a 401 error', function (done) {
    frisby.post(REST_URL + '/user/reset-password', {
      new: '12345',
      repeat: '1234_'
    }, { json: true })
      .expect('status', 401)
      .done(done)
  })
})
