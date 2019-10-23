const chai = require('chai')
const expect = chai.expect

const path = require('path')
const kpio = require('keepass.io')

describe('keePass', () => {
  it('should unlock support team KeePass file with photo of readheaded call center employee', (done) => {
    const db = new kpio.Database()
    db.addCredential(new kpio.Credentials.Keyfile(path.join(__dirname, '../../frontend/src/assets/public/images/carousel/6.jpg')))
    db.loadFile(path.join(__dirname, '../../ftp/incident-support.kdbx'), function (err) {
      expect(err).to.equal(undefined)
      return done()
    })
  })
})
