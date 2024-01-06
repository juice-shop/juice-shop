/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
import config from 'config'
import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('appVersion', () => {
  const retrieveAppVersion = require('../../routes/appVersion')
  let req: any
  let res: any

  it('should ' + config.get<boolean>('application.showVersionNumber') ? '' : 'not ' + 'return version specified in package.json', () => {
    req = {}
    res = { json: sinon.spy() }

    retrieveAppVersion()(req, res)
    expect(res.json).to.have.been.calledWith({ version: config.get<boolean>('application.showVersionNumber') ? require('../../package.json').version : '' })
  })
})
