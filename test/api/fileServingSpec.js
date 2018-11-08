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
  it('GET responds with index.html when visiting application URL', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'main.js')
      .expect('bodyContains', 'runtime.js')
      .expect('bodyContains', 'polyfills.js')
  })

  it('GET responds with index.html when visiting application URL with any path', () => {
    return frisby.get(URL + '/whatever')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'main.js')
      .expect('bodyContains', 'runtime.js')
      .expect('bodyContains', 'polyfills.js')
  })

  it('GET a restricted file directly from file system path on server via Directory Traversal attack loads index.html instead', () => {
    return frisby.get(URL + '/public/images/../../ftp/eastere.gg')
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="An intentionally insecure JavaScript Web Application">')
  })

  it('GET a restricted file directly from file system path on server via URL-encoded Directory Traversal attack loads index.html instead', () => {
    return frisby.get(URL + '/public/images/%2e%2e%2f%2e%2e%2fftp/eastere.gg')
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="An intentionally insecure JavaScript Web Application">')
  })

  it('GET serves a security.txt file', () => {
    return frisby.get(URL + '/security.txt')
      .expect('status', 200)
  })

  it('GET serves a robots.txt file', () => {
    return frisby.get(URL + '/robots.txt')
      .expect('status', 200)
  })
})

describe('/public/images/tracking', () => {
  it('GET tracking image for "Score Board" page access challenge', () => {
    return frisby.get(URL + '/assets/public/images/tracking/scoreboard.png')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })

  it('GET tracking image for "Administration" page access challenge', () => {
    return frisby.get(URL + '/assets/public/images/tracking/administration.png')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })
})

describe('/encryptionkeys', () => {
  it('GET serves a directory listing', () => {
    return frisby.get(URL + '/encryptionkeys')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>listing directory /encryptionkeys</title>')
  })

  it('GET a non-existing file in will return a 404 error', () => {
    return frisby.get(URL + '/encryptionkeys/doesnotexist.md')
      .expect('status', 404)
  })

  it('GET the Premium Content AES key', () => {
    return frisby.get(URL + '/encryptionkeys/premium.key')
      .expect('status', 200)
  })

  it('GET a key file whose name contains a "/" fails with a 403 error', () => {
    frisby.fetch(URL + '/encryptionkeys/%2fetc%2fos-release%2500.md', {}, { urlEncode: false })
      .expect('status', 403)
      .expect('bodyContains', 'Error: File names cannot contain forward slashes!')
  })
})

describe('Hidden URL', () => {
  it('GET the second easter egg by visiting the Base64>ROT13-decrypted URL', () => {
    return frisby.get(URL + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>Welcome to Planet Orangeuze</title>')
  })

  it('GET the premium content by visiting the ROT5>Base64>z85>ROT5-decrypted URL', () => {
    return frisby.get(URL + '/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
      .expect('status', 200)
      .expect('header', 'content-type', 'image/gif')
  })

  it('GET Klingon translation file for "Extra Language" challenge', () => {
    return frisby.get(URL + '/assets/i18n/tlh_AA.json')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
  })

  it('GET blueprint file for "Retrieve Blueprint" challenge', () => {
    return frisby.get(URL + '/assets/public/images/products/' + blueprint)
      .expect('status', 200)
  })
})
