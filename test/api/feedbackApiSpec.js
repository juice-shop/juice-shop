const frisby = require('frisby')
const Joi = frisby.Joi
var insecurity = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'

const authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': /application\/json/ }
const jsonHeader = { 'content-type': 'application/json' }

describe('/Feedbacks', function () {
  it('GET all feedback', function (done) {
    frisby.get(API_URL + '/Feedbacks')
      .expect('status', 200)
      .done(done)
  })

  it('POST sanitizes unsafe HTML from comment', function (done) {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'I am a harm<script>steal-cookie</script><img src="csrf-attack"/><iframe src="evil-content"></iframe>less comment.',
        rating: 1
      }
    })
      .expect('status', 200)
      .expect('json', 'data', {
        comment: 'I am a harmless comment.'
      })
      .done(done)
  })

  it('POST fails to sanitize masked CSRF-attack by not applying sanitization recursively', function (done) {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <<script>alert("XSS4")</script>script>alert("XSS4")<</script>/script>',
        rating: 1
      }
    })
      .expect('status', 200)
      .expect('json', 'data', {
        comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <script>alert("XSS4")</script>'
      })
      .done(done)
  })

  it('POST feedback in another users name as anonymous user', function (done) {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'Lousy crap! You use sequelize 1.7.x? Welcome to SQL Injection-land, morons! As if that is not bad enough, you use z85/base85 and hashids for crypto? Even MD5 to hash passwords! Srsly?!?!',
        rating: 1,
        UserId: 3
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {
        UserId: 3
      }).done(done)
  })

  it('POST feedback in a non-existing users name as anonymous user', function (done) {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'When juice fails... with stupid JWT secrets like ' + insecurity.defaultSecret,
        rating: 0,
        UserId: 4711
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {
        UserId: 4711
      }).done(done)
  })

  it('POST feedback can be created without actually supplying data', function (done) {
    frisby.post(API_URL + '/Feedbacks', { headers: jsonHeader, body: {} })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        comment: Joi.any().allow('undefined'),
        rating: Joi.any().forbidden(),
        UserId: Joi.any().forbidden()
      })
      .done(done)
  })
})

describe('/Feedbacks/:id', function () {
  it('GET existing feedback by id is forbidden via public API', function (done) {
    frisby.get(API_URL + '/Feedbacks/1')
      .expect('status', 401)
      .done(done)
  })

  it('GET existing feedback by id', function (done) {
    frisby.get(API_URL + '/Feedbacks/1', { headers: authHeader })
      .expect('status', 200)
      .done(done)
  })

  it('PUT update existing feedback is forbidden via public API', function (done) {
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

  xit('PUT update existing feedback', function (done) { // FIXME Does not update the rating
    frisby.put(API_URL + '/Feedbacks/2', {
      headers: authHeader,
      body: {
        rating: 0
      }
    })
      .expect('status', 200)
      .expect('json', { rating: 0 })
      .done(done)
  })

  it('DELETE existing feedback is forbidden via public API', function (done) {
    frisby.del(API_URL + '/Feedbacks/1')
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing feedback', function (done) {
    frisby.post(API_URL + '/Feedbacks', {
      headers: jsonHeader,
      body: {
        comment: 'I will be gone soon!',
        rating: 1
      }
    })
      .expect('status', 200)
      .expect('jsonTypes', 'data', { id: Joi.number() })
      .then(function (res) {
        frisby.del(API_URL + '/Feedbacks/' + res.json.data.id, { headers: authHeader })
          .expect('status', 200)
          .done(done)
      })
      .done(done)
  })
})
