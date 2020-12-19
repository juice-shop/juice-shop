/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('countryMapping', () => {
  const countryMapping = require('../../routes/countryMapping')

  beforeEach(() => {
    this.req = {}
    this.res = { send: sinon.spy(), status: sinon.stub().returns({ send: sinon.spy() }) }
  })

  it('should return configured country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns('TEST') })(this.req, this.res)

    expect(this.res.send).to.have.been.calledWith('TEST')
  })

  it('should return server error when configuration has no country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns(null) })(this.req, this.res)

    expect(this.res.status).to.have.been.calledWith(500)
  })

  it('should return server error for default configuration', () => {
    countryMapping()(this.req, this.res)

    expect(this.res.status).to.have.been.calledWith(500)
  })
})
