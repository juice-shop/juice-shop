/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import config, { type IConfig } from 'config'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { countryMapping } from '../../routes/countryMapping'
const expect = chai.expect
chai.use(sinonChai)

describe('countryMapping', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = { send: sinon.spy(), status: sinon.stub().returns({ send: sinon.spy() }) }
  })

  it('should return configured country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns('TEST') } as unknown as IConfig)(req, res)

    expect(res.send).to.have.been.calledWith('TEST')
  })

  it('should return server error when configuration has no country mappings', () => {
    countryMapping({ get: sinon.stub().withArgs('ctf.countryMapping').returns(null) } as unknown as IConfig)(req, res)

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
