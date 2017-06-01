var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('appConfiguration', function () {
  it('should return configuration object', function () {
    var retrieveAppConfiguration = require('../../routes/appConfiguration')

    var req = {}
    var res = { json: sinon.spy() }

    retrieveAppConfiguration()(req, res)
    expect(res.json).to.have.been.calledWith({ config: require('config') })
  })
})
