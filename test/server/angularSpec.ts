/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('angular', () => {
  const serveAngularClient = require('../../routes/angular')
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { }
    res = { sendFile: sinon.spy() }
    next = sinon.spy()
  })

  it('should serve index.html for any URL', () => {
    req.url = '/any/thing'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/index\.html/))
  })

  it('should raise error for /api endpoint URL', () => {
    req.url = '/api'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('should raise error for /rest endpoint URL', () => {
    req.url = '/rest'

    serveAngularClient()(req, res, next)

    expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })
})
