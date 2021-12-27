/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('appVersion', () => {
  const retrieveAppVersion = require('../../routes/appVersion')
  let req: any
  let res: any

  it('should return version specified in package.json', () => {
    req = {}
    res = { json: sinon.spy() }

    retrieveAppVersion()(req, res)
    expect(res.json).to.have.been.calledWith({ version: require('../../package.json').version })
  })
})
