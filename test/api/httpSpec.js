const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('HTTP', () => {
  it('response must contain CORS header allowing all origins', done => {
    frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'Access-Control-Allow-Origin', '*')
      .done(done)
  })

  it('response must contain sameorigin frameguard header', done => {
    frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'X-Frame-Options', 'sameorigin')
      .done(done)
  })

  it('response must contain CORS header allowing all origins', done => {
    frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'X-Content-Type-Options', 'nosniff')
      .done(done)
  })

  it('response must not contain XSS protection header', done => {
    frisby.get(URL)
      .expect('status', 200)
      .expectNot('header', 'X-XSS-Protection')
      .done(done)
  })
})
