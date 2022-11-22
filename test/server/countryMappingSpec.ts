/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const config = require('config')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('countryMapping', () => {
  const countryMapping = require('../../routes/countryMapping')
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = { send: sinon.spy(), status: sinon.stub().returns({ send: sinon.spy() }) }
  })

  it('should return configured country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns('TEST') })(req, res)

    expect(res.send).to.have.been.calledWith('TEST')
  })

  it('should return server error when configuration has no country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns(null) })(req, res)

    expect(res.status).to.have.been.calledWith(500)
  })

  it('should return ' + (config.get('ctf.countryMapping') ? 'no ' : '') + 'server error for active configuration from config/' + process.env.NODE_ENV + '.yml', () => {
    countryMapping()(req, res)

    if (config.get('ctf.countryMapping')) {
      expect(res.send).to.have.been.calledWith(config.get('ctf.countryMapping'))
    } else {
      expect(res.status).to.have.been.calledWith(500)
    }
  })
})
