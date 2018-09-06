const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': /application\/json/ }
const jsonHeader = { 'content-type': 'application/json' }

describe('/api/Feedbacks', () => {
  let captchaId, captchaAnswer

  beforeAll(done => {
    frisby.get(REST_URL + '/captcha')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        captchaId = json.captchaId
        captchaAnswer = json.answer
      })
      .done(done)
  })

  it('GET all feedback', done => {
    frisby.get(API_URL + '/Feedbacks')
      .expect('status', 200)
      .done(done)
  })

  it('POST sanitizes unsafe HTML from comment', done => {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'I am a harm<script>steal-cookie</script><img src="csrf-attack"/><iframe src="evil-content"></iframe>less comment.',
        rating: 1,
        captchaId: captchaId,
        captcha: captchaAnswer
      }
    })
      .expect('status', 201)
      .expect('json', 'data', {
        comment: 'I am a harmless comment.'
      })
      .done(done)
  })

  it('POST fails to sanitize masked CSRF-attack by not applying sanitization recursively', done => {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <<script>alert("XSS")</script>script>alert("XSS")<</script>/script>',
        rating: 1,
        captchaId: captchaId,
        captcha: captchaAnswer
      }
    })
      .expect('status', 201)
      .expect('json', 'data', {
        comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <script>alert("XSS")</script>'
      })
      .done(done)
  })

  it('POST feedback in another users name as anonymous user', done => {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'Lousy crap! You use sequelize 1.7.x? Welcome to SQL Injection-land, morons! As if that is not bad enough, you use z85/base85 and hashids for crypto? Even MD5 to hash passwords! Srsly?!?!',
        rating: 1,
        UserId: 3,
        captchaId: captchaId,
        captcha: captchaAnswer
      }
    })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {
        UserId: 3
      }).done(done)
  })

  it('POST feedback in a non-existing users name as anonymous user fails with constraint error', done => {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'Pickle Rick says your express-jwt 0.1.3 has issues!',
        rating: 0,
        UserId: 4711,
        captchaId: captchaId,
        captcha: captchaAnswer
      }
    })
      .expect('status', 500)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.errors).toContain('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed')
      })
      .done(done)
  })

  it('POST feedback is associated with current user', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(({ json }) => frisby.post(API_URL + '/Feedbacks', {
        headers: { 'Authorization': 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
        body: {
          comment: 'Stupid JWT secret "' + insecurity.defaultSecret + '" and being typosquatted by epilogue-js and angular-tooltipps!',
          rating: 5,
          UserId: 4,
          captchaId: captchaId,
          captcha: captchaAnswer
        }
      })
        .expect('status', 201)
        .expect('header', 'content-type', /application\/json/)
        .expect('json', 'data', {
          UserId: 4
        }))
      .done(done)
  })

  it('POST feedback is associated with any passed user ID', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(({ json }) => frisby.post(API_URL + '/Feedbacks', {
        headers: { 'Authorization': 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
        body: {
          comment: 'Bender\'s choice award!',
          rating: 5,
          UserId: 3,
          captchaId: captchaId,
          captcha: captchaAnswer
        }
      })
        .expect('status', 201)
        .expect('header', 'content-type', /application\/json/)
        .expect('json', 'data', {
          UserId: 3
        }))
      .done(done)
  })

  it('POST feedback can be created without actually supplying comment', done => {
    frisby.post(API_URL + '/Feedbacks', { headers: jsonHeader,
      body: { rating: 1,
        captchaId: captchaId,
        captcha: captchaAnswer
      } })
      .expect('status', 201)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {
        comment: null,
        rating: 1
      })
      .done(done)
  })

  it('POST feedback cannot be created without actually supplying rating', done => {
    frisby.post(API_URL + '/Feedbacks', { headers: jsonHeader,
      body: { captchaId: captchaId,
        captcha: captchaAnswer
      } })
      .expect('status', 400)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        message: Joi.string()
      })
      .then(({ json }) => {
        expect(json.message.match(/notNull Violation: (Feedback\.)?rating cannot be null/))
      })
      .done(done)
  })
})

describe('/api/Feedbacks/:id', () => {
  let captchaId, captchaAnswer

  beforeAll(done => {
    frisby.get(REST_URL + '/captcha')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        captchaId = json.captchaId
        captchaAnswer = json.answer
      })
      .done(done)
  })

  it('GET existing feedback by id is forbidden via public API', done => {
    frisby.get(API_URL + '/Feedbacks/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET existing feedback by id', done => {
    frisby.get(API_URL + '/Feedbacks/1', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('PUT update existing feedback is forbidden via public API', done => {
    frisby.put(API_URL + '/Feedbacks/1', {
      headers: jsonHeader,
      body: {
        comment: 'This sucks like nothing has ever sucked before',
        rating: 1
      }
    })
      .expect('status', 401)
      .done(done)
  })

  xit('PUT update existing feedback', done => { // FIXME Verify if put is actually meant to work
    frisby.put(API_URL + '/Feedbacks/2', {
      headers: authHeader,
      body: {
        rating: 0
      }
    })
      .expect('status', 200)
      .expect('json', 'data', { rating: 0 })
      .done(done)
  })

  it('DELETE existing feedback is forbidden via public API', done => {
    frisby.del(API_URL + '/Feedbacks/1')
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing feedback', done => {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'I will be gone soon!',
        rating: 1,
        captchaId: captchaId,
        captcha: captchaAnswer
      }
    })
      .expect('status', 201)
      .expect('jsonTypes', 'data', { id: Joi.number() })
      .then(({ json }) => {
        frisby.del(API_URL + '/Feedbacks/' + json.data.id, { headers: authHeader })
          .expect('status', 200)
          .done(done)
      })
      .done(done)
  })
})
