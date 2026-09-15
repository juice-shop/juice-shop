/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import config from 'config'

import { version } from '../../package.json'
import { retrieveAppVersion } from '../../routes/appVersion'

void describe('appVersion', () => {
  void it('should ' + config.get<boolean>('application.showVersionNumber') ? '' : 'not ' + 'return version specified in package.json', () => {
    const req: any = {}
    const res: any = { json: mock.fn() }

    retrieveAppVersion()(req, res)
    assert.deepEqual(res.json.mock.calls[0].arguments[0], { version: config.get<boolean>('application.showVersionNumber') ? version : '' })
  })
})
