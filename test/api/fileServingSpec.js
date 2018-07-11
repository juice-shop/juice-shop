const frisby = require('frisby')
const config = require('config')

const URL = 'http://localhost:3000'

let blueprint

for (const product of config.get('products')) {
  if (product.fileForRetrieveBlueprintChallenge) {
    blueprint = product.fileForRetrieveBlueprintChallenge
    break
  }
}

describe('Server', () => {
  it('GET responds with index.html when visiting application URL', done => {
    frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'dist/juice-shop.min.js')
      .done(done)
  })

  it('GET responds with index.html when visiting application URL with any path', done => {
    frisby.get(URL + '/whatever')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'dist/juice-shop.min.js')
      .done(done)
  })

  it('GET a restricted file directly from file system path on server via Directory Traversal attack loads index.html instead', done => {
    frisby.get(URL + '/public/images/../../ftp/eastere.gg')
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="An intentionally insecure JavaScript Web Application">')
      .done(done)
  })

  it('GET a restricted file directly from file system path on server via URL-encoded Directory Traversal attack loads index.html instead', done => {
    frisby.get(URL + '/public/images/%2e%2e%2f%2e%2e%2fftp/eastere.gg')
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="An intentionally insecure JavaScript Web Application">')
      .done(done)
  })

  it('GET serves a security.txt file', done => {
    frisby.get(URL + '/security.txt')
      .expect('status', 200)
      .done(done)
  })

  it('GET serves a robots.txt file', done => {
    frisby.get(URL + '/robots.txt')
      .expect('status', 200)
      .done(done)
  })
})

describe('/public/images/tracking', () => {
  it('GET tracking image for "Score Board" page access challenge', done => {
    frisby.get(URL + '/public/images/tracking/scoreboard.png')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
      .done(done)
  })

  it('GET tracking image for "Administration" page access challenge', done => {
    frisby.get(URL + '/public/images/tracking/administration.png')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
      .done(done)
  })

  it('GET tracking background image for "Geocities Theme" challenge', done => {
    frisby.get(URL + '/public/images/tracking/microfab.gif')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/gif')
      .done(done)
  })
})

describe('/encryptionkeys', () => {
  it('GET serves a directory listing', done => {
    frisby.get(URL + '/encryptionkeys')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>listing directory /encryptionkeys</title>')
      .done(done)
  })

  it('GET a non-existing file in will return a 404 error', done => {
    frisby.get(URL + '/encryptionkeys/doesnotexist.md')
      .expect('status', 404)
      .done(done)
  })

  it('GET the Premium Content AES key', done => {
    frisby.get(URL + '/encryptionkeys/premium.key')
      .expect('status', 200)
      .done(done)
  })

  it('GET a key file whose name contains a "/" fails with a 403 error', done => {
    frisby.fetch(URL + '/encryptionkeys/%2fetc%2fos-release%2500.md', {}, { urlEncode: false })
      .expect('status', 403)
      .expect('bodyContains', 'Error: File names cannot contain forward slashes!')
      .done(done)
  })
})

describe('Hidden URL', () => {
  it('GET the second easter egg by visiting the Base64>ROT13-decrypted URL', done => {
    frisby.get(URL + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>Welcome to Planet Orangeuze</title>')
      .done(done)
  })

  it('GET the premium content by visiting the ROT5>Base64>z85>ROT5-decrypted URL', done => {
    frisby.get(URL + '/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/gif')
      .done(done)
  })

  it('GET Geocities theme CSS is accessible directly from file system path', done => {
    frisby.get(URL + '/css/geo-bootstrap/swatch/bootstrap.css')
      .expect('status', 200)
      .expect('bodyContains', 'Designed and built with all the love in the world @twitter by @mdo and @fat.')
      .done(done)
  })

  it('GET Klingon translation file for "Extra Language" challenge', done => {
    frisby.get(URL + '/i18n/tlh_AA.json')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .done(done)
  })

  it('GET blueprint file for "Retrieve Blueprint" challenge', done => {
    frisby.get(URL + '/public/images/products/' + blueprint)
      .expect('status', 200)
      .done(done)
  })
})
