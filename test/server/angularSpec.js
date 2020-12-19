/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('angular', () => {
  const serveAngularClient = require('../../routes/angular')

  beforeEach(() => {
    this.req = { }
    this.res = { sendFile: sinon.spy() }
    this.next = sinon.spy()
  })

  it('should serve index.html for any URL', () => {
    this.req.url = '/any/thing'

    serveAngularClient()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/index\.html/))
  })

  it('should raise error for /api endpoint URL', () => {
    this.req.url = '/api'

    serveAngularClient()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('should raise error for /rest endpoint URL', () => {
    this.req.url = '/rest'

    serveAngularClient()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })
})
