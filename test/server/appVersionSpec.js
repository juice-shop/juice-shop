var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('appVersion', function () {
  it('should return version specified in package.json', function () {
    var retrieveAppVersion = require('../../routes/appVersion')
    var req = {}
    var res = { json: sinon.spy() }

    retrieveAppVersion()(req, res)
    expect(res.json).to.have.been.calledWith({ version: require('../../package.json').version })
  })
})
