/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('keyServer', () => {
  const serveKeyFiles = require('../../routes/keyServer')

  beforeEach(() => {
    this.req = { params: { } }
    this.res = { sendFile: sinon.spy(), status: sinon.spy() }
    this.next = sinon.spy()
  })

  it('should serve requested file from folder /encryptionkeys', () => {
    this.req.params.file = 'test.file'

    serveKeyFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/encryptionkeys[/\\]test.file/))
  })

  it('should raise error for slashes in filename', () => {
    this.req.params.file = '../../../../nice.try'

    serveKeyFiles()(this.req, this.res, this.next)

    expect(this.res.sendFile).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })
})
