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

  void it('should not expose private IPs in authorizedRedirects', () => {
    req = {}
    res = { json: mock.fn() }

    retrieveAppConfiguration()(req, res)
    const returnedConfig = res.json.mock.calls[0].arguments[0].config
    if (returnedConfig.application?.googleOauth?.authorizedRedirects) {
      const privateIpRegex = /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/
      for (const r of returnedConfig.application.googleOauth.authorizedRedirects) {
        const url = new URL(r.uri)
        assert.ok(!privateIpRegex.test(url.hostname))
      }
    }
  })
})
