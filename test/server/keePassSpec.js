const chai = require('chai')
const expect = chai.expect

const path = require('path')
const kpio = require('keepass.io')

describe('keePass', () => {
  xit('should unlock support team KeePass file with photo of readheaded call center employee', (done) => { //FIXME Fails with "KpioDatabaseError: Could not decrypt database. Either the credentials were invalid or the database is corrupt." although correct file is supplied
    const db = new kpio.Database()
    db.addCredential(new kpio.Credentials.Keyfile(path.join(__dirname, '../../frontend/src/assets/public/images/carousel/6.jpg')))
    db.loadFile(path.join(__dirname, '../../ftp/incident-support.kdbx'), function (err) {
      expect(err).to.equal(undefined)
      return done()
    })
  })
})
