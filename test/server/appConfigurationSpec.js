const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('appConfiguration', () => {
  it('should return configuration object', () => {
    const retrieveAppConfiguration = require('../../routes/appConfiguration')
    const req = {}
    const res = { json: sinon.spy() }

    retrieveAppConfiguration()(req, res)
    expect(res.json).to.have.been.calledWith({ config: require('config') })
  })
})
