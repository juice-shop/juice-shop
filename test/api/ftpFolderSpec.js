const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/ftp', () => {
  it('GET serves a directory listing', done => {
    frisby.get(URL + '/ftp')
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>listing directory /ftp</title>')
      .done(done)
  })

  it('GET a non-existing Markdown file in /ftp will return a 404 error', done => {
    frisby.get(URL + '/ftp/doesnotexist.md')
      .expect('status', 404)
      .done(done)
  })

  it('GET a non-existing PDF file in /ftp will return a 404 error', done => {
    frisby.get(URL + '/ftp/doesnotexist.pdf')
      .expect('status', 404)
      .done(done)
  })

  it('GET a non-existing file in /ftp will return a 403 error for invalid file type', done => {
    frisby.get(URL + '/ftp/doesnotexist.exe')
      .expect('status', 403)
      .done(done)
  })

  it('GET an existing file in /ftp will return a 403 error for invalid file type .gg', done => {
    frisby.get(URL + '/ftp/eastere.gg')
      .expect('status', 403)
      .done(done)
  })

  it('GET existing file /ftp/coupons_2013.md.bak will return a 403 error for invalid file type .bak', done => {
    frisby.get(URL + '/ftp/coupons_2013.md.bak')
      .expect('status', 403)
      .done(done)
  })

  it('GET existing file /ftp/package.json.bak will return a 403 error for invalid file type .bak', done => {
    frisby.get(URL + '/ftp/package.json.bak')
      .expect('status', 403)
      .done(done)
  })

  it('GET existing file /ftp/suspicious_errors.yml will return a 403 error for invalid file type .yml', done => {
    frisby.get(URL + '/ftp/suspicious_errors.yml')
      .expect('status', 403)
      .done(done)
  })

  it('GET the confidential file in /ftp', done => {
    frisby.get(URL + '/ftp/acquisitions.md')
      .expect('status', 200)
      .expect('bodyContains', '# Planned Acquisitions')
      .done(done)
  })

  it('GET the KeePass database in /ftp', done => {
    frisby.get(URL + '/ftp/incident-support.kdbx')
      .expect('status', 200)
      .done(done)
  })

  it('GET the easter egg file by using Poison Null Byte attack with .pdf suffix', done => {
    frisby.get(URL + '/ftp/eastere.gg%00.pdf')
      .expect('status', 200)
      .expect('bodyContains', 'Congratulations, you found the easter egg!')
      .done(done)
  })

  it('GET the easter egg file by using Poison Null Byte attack with .md suffix', done => {
    frisby.get(URL + '/ftp/eastere.gg%00.md')
      .expect('status', 200)
      .expect('bodyContains', 'Congratulations, you found the easter egg!')
      .done(done)
  })
  it('GET the SIEM signature file by using Poison Null Byte attack with .pdf suffix', done => {
    frisby.get(URL + '/ftp/suspicious_errors.yml%00.pdf')
      .expect('status', 200)
      .expect('bodyContains', 'Suspicious error messages specific to the application')
      .done(done)
  })

  it('GET the SIEM signature file by using Poison Null Byte attack with .md suffix', done => {
    frisby.get(URL + '/ftp/suspicious_errors.yml%00.md')
      .expect('status', 200)
      .expect('bodyContains', 'Suspicious error messages specific to the application')
      .done(done)
  })

  it('GET the 2013 coupon code file by using Poison Null Byte attack with .pdf suffix', done => {
    frisby.get(URL + '/ftp/coupons_2013.md.bak%00.pdf')
      .expect('status', 200)
      .expect('bodyContains', 'n<MibgC7sn')
      .done(done)
  })

  it('GET the 2013 coupon code file by using an Poison Null Byte attack with .md suffix', done => {
    frisby.get(URL + '/ftp/coupons_2013.md.bak%00.md')
      .expect('status', 200)
      .expect('bodyContains', 'n<MibgC7sn')
      .done(done)
  })

  it('GET the 2013 coupon code file by appending md_debug parameter with value fulfilling filename validation', done => {
    frisby.get(URL + '/ftp/coupons_2013.md.bak?md_debug=.pdf')
      .expect('status', 200)
      .expect('bodyContains', 'n<MibgC7sn')
      .done(done)
  })

  it('GET the package.json file does not fall for appending md_debug parameter with value fulfilling filename validation', done => {
    frisby.get(URL + '/ftp/package.json.bak?md_debug=.md')
      .expect('status', 403)
      .done(done)
  })

  it('GET the package.json file by using Poison Null Byte attack with .pdf suffix', done => {
    frisby.get(URL + '/ftp/package.json.bak%00.pdf')
      .expect('status', 200)
      .expect('bodyContains', '"name": "juice-shop",')
      .done(done)
  })

  it('GET the package.json file by using Poison Null Byte attack with .md suffix', done => {
    frisby.get(URL + '/ftp/package.json.bak%00.md')
      .expect('status', 200)
      .expect('bodyContains', '"name": "juice-shop",')
      .done(done)
  })

  it('GET a restricted file directly from file system path on server by tricking route definitions fails with 403 error', done => {
    frisby.get(URL + '/ftp///eastere.gg')
      .expect('status', 403)
      .done(done)
  })

  it('GET a restricted file directly from file system path on server by appending URL parameter fails with 403 error', done => {
    frisby.get(URL + '/ftp/eastere.gg?.md')
      .expect('status', 403)
      .done(done)
  })

  it('GET a file whose name contains a "/" fails with a 403 error', done => {
    frisby.fetch(URL + '/ftp/%2fetc%2fos-release%2500.md', {}, { urlEncode: false })
      .expect('status', 403)
      .expect('bodyContains', 'Error: File names cannot contain forward slashes!')
      .done(done)
  })

  it('GET an accessible file directly from file system path on server', done => {
    frisby.get(URL + '/ftp/legal.md')
      .expect('status', 200)
      .expect('bodyContains', '# Legal Information')
      .done(done)
  })

  it('GET an accessible markdown file directly from file system path on server with md_debug parameter', done => {
    frisby.get(URL + '/ftp/legal.md?md_debug=true')
      .expect('status', 200)
      .expect('bodyContains', '# Legal Information')
      .done(done)
  })

  it('GET a non-existing file via direct server file path /ftp will return a 404 error', done => {
    frisby.get(URL + '/ftp/doesnotexist.md')
      .expect('status', 404)
      .done(done)
  })
})
