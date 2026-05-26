/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { retrieveAppConfiguration } from '../../routes/appConfiguration'

void describe('appConfiguration', () => {
  let req: any
  let res: any

  void it('should return configuration object', () => {
    req = {}
    res = { json: mock.fn() }

    retrieveAppConfiguration()(req, res)
    assert.equal(res.json.mock.calls.length, 1)
    const returnedConfig = res.json.mock.calls[0].arguments[0].config
    assert.ok(returnedConfig.application != null)
  })

  void it('should not expose chatBot.llmApiUrl', () => {
    req = {}
    res = { json: mock.fn() }

    retrieveAppConfiguration()(req, res)
    const returnedConfig = res.json.mock.calls[0].arguments[0].config
    assert.ok(returnedConfig.application.chatBot != null)
    assert.ok(!('llmApiUrl' in returnedConfig.application.chatBot))
  })
})
