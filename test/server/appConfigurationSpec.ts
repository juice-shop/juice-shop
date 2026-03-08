/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import config from 'config'
import { retrieveAppConfiguration } from '../../routes/appConfiguration'
const expect = chai.expect
chai.use(sinonChai)

describe('appConfiguration', () => {
  let req: any
  let res: any

  it('should return public-safe configuration object', () => {
    req = {}
    res = { json: sinon.spy() }

    retrieveAppConfiguration()(req, res)
    expect(res.json.calledOnce).to.equal(true)

    const payload = res.json.firstCall.args[0]
    expect(payload.config).to.be.an('object')
    expect(payload.config.application.name).to.equal(config.get<string>('application.name'))

    const redirects = payload.config.application.googleOauth.authorizedRedirects.map(({ uri }: { uri: string }) => uri)
    expect(redirects).to.include('http://localhost:3000')
    expect(redirects).to.not.include('http://127.0.0.1:3000')
    expect(redirects).to.not.include('http://127.0.0.1:4200')
    expect(redirects).to.not.include('http://192.168.99.100:3000')
    expect(redirects).to.not.include('http://192.168.99.100:4200')
  })
})
