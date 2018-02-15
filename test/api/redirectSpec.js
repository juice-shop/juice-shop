const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/redirect', () => {
  it('GET redirected to https://github.com/bkimminich/juice-shop when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=https://github.com/bkimminich/juice-shop', { redirect: 'manual' })
      .expect('status', 302)
      .done(done)
  })

  it('GET redirected to https://gratipay.com/juice-shop when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=https://gratipay.com/juice-shop', { redirect: 'manual' })
      .expect('status', 302)
      .done(done)
  })

  it('GET redirected to https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm', { redirect: 'manual' })
    .expect('status', 302)
    .done(done)
  })

  it('GET redirected to http://shop.spreadshirt.com/juiceshop when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=http://shop.spreadshirt.com/juiceshop', { redirect: 'manual' })
    .expect('status', 302)
    .done(done)
  })

  it('GET redirected to http://shop.spreadshirt.de/juiceshop when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=http://shop.spreadshirt.de/juiceshop', { redirect: 'manual' })
    .expect('status', 302)
    .done(done)
  })

  it('GET redirected to https://www.stickeryou.com/products/owasp-juice-shop/794 when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=https://www.stickeryou.com/products/owasp-juice-shop/794', { redirect: 'manual' })
    .expect('status', 302)
    .done(done)
  })

  it('GET redirected to https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW when this URL is passed as "to" parameter', done => {
    frisby.get(URL + '/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW', { redirect: 'manual' })
    .expect('status', 302)
    .done(done)
  })

  it('GET error message with information leakage when calling /redirect without query parameter', done => {
    frisby.get(URL + '/redirect')
    .expect('status', 500)
    .expect('header', 'content-type', /text\/html/)
    .expect('bodyContains', '<h1>Juice Shop (Express ~')
    .expect('bodyContains', 'TypeError')
    .expect('bodyContains', '&#39;includes&#39; of undefined')
    .done(done)
  })

  it('GET error message with information leakage when calling /redirect with unrecognized query parameter', done => {
    frisby.get(URL + '/redirect?x=y')
    .expect('status', 500)
    .expect('header', 'content-type', /text\/html/)
    .expect('bodyContains', '<h1>Juice Shop (Express ~')
    .expect('bodyContains', 'TypeError')
    .expect('bodyContains', '&#39;includes&#39; of undefined')
    .done(done)
  })

  it('GET error message hinting at whitelist validation when calling /redirect with an unrecognized "to" target', done => {
    frisby.get(URL + '/redirect?to=whatever')
    .expect('status', 406)
    .expect('header', 'content-type', /text\/html/)
    .expect('bodyContains', '<h1>Juice Shop (Express ~')
    .expect('bodyContains', 'Unrecognized target URL for redirect: whatever')
    .done(done)
  })

  it('GET redirected to target URL in "to" parameter when a white-listed URL is part of the query string', done => {
    frisby.get(URL + '/redirect?to=/score-board?satisfyIndexOf=https://github.com/bkimminich/juice-shop')
    .expect('status', 200)
    .expect('header', 'content-type', /text\/html/)
    .expect('bodyContains', 'dist/juice-shop.min.js')
    .done(done)
  })
})
