/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs/promises'
import pug from 'pug'
import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'

import { getUserProfile } from '../../routes/userProfile'
import * as security from '../../lib/insecurity'
import { UserModel } from '../../models/user'

const expect = chai.expect
chai.use(sinonChai)

describe('userProfile', () => {
  let req: any
  let res: any
  let next: any
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    req = {
      cookies: { token: 'token' },
      socket: { remoteAddress: '127.0.0.1' },
      app: { locals: {} }
    }
    res = {
      set: sandbox.stub().callsFake((headers: Record<string, string>) => {
        const csp = headers['Content-Security-Policy']
        if (/[\r\n]/.test(csp)) {
          throw new TypeError('Invalid character in header content ["Content-Security-Policy"]')
        }
      }),
      send: sandbox.stub()
    }
    next = sandbox.stub()

    sandbox.stub(fs, 'readFile').resolves('profile-template')
    sandbox.stub(pug, 'compile').returns(() => '<html>profile</html>')
    sandbox.stub(security.authenticatedUsers, 'get').returns({ data: { id: 1 } } as any)
    sandbox.stub(UserModel, 'findByPk').resolves({
      username: 'jim',
      email: 'jim@juice-sh.op',
      profileImage: 'https://notanimage.here/100/100\nscript-src evil'
    } as any)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('renders the profile for stored image URLs with control characters', async () => {
    await getUserProfile()(req, res, next)

    expect(res.set.calledOnce).to.equal(true)
    expect(res.set.firstCall.args[0]['Content-Security-Policy']).to.not.match(/[\r\n]/)
    expect(res.send).to.have.been.calledOnceWith('<html>profile</html>')
    expect(next.called).to.equal(false)
  })
})
