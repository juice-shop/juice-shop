/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { retrieveAppConfiguration } from '../../routes/appConfiguration'
const expect = chai.expect
chai.use(sinonChai)

describe('appConfiguration', () => {
  let req: any
  let res: any

  it('should return configuration object', () => {
    req = {}
    res = { json: sinon.spy() }

    retrieveAppConfiguration()(req, res)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(res.json).to.have.been.calledOnce
    const returnedConfig = res.json.firstCall.args[0].config
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(returnedConfig.application).to.exist
  })

  it('should not expose chatBot.llmApiUrl', () => {
    req = {}
    res = { json: sinon.spy() }

    retrieveAppConfiguration()(req, res)
    const returnedConfig = res.json.firstCall.args[0].config
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(returnedConfig.application.chatBot).to.exist
    expect(returnedConfig.application.chatBot).to.not.have.property('llmApiUrl')
  })
})
