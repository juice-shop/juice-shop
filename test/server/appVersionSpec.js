const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('appVersion', () => {
  it('should return version specified in package.json', () => {
    const retrieveAppVersion = require('../../routes/appVersion')
    const req = {}
    const res = { json: sinon.spy() }

    retrieveAppVersion()(req, res)
    expect(res.json).to.have.been.calledWith({ version: require('../../package.json').version })
  })
})
