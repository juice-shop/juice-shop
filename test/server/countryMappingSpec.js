const config = require('config')
const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('countryMapping', () => {
  const countryMapping = require('../../routes/countryMapping')

  beforeEach(() => {
    this.req = { }
    this.res = { send: sinon.spy(), status: sinon.stub().returns({ send: sinon.spy() })  }
  })

  xit('should return configured country mapping for FBCTF customization', () => {
    // TODO Force fbctf.yml to load or mock accordingly
    countryMapping()(this.req, this.res)

    expect(this.res.send).to.have.been.calledWith(config.get('ctf.countryMapping'))
  })

  it('should return server error when configuration has no country mappings', () => {
    countryMapping()(this.req, this.res)

    expect(this.res.status).to.have.been.calledWith(500)
  })
})
