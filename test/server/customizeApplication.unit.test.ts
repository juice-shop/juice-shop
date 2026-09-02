/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const config = require('config')
const { retrieveCustomFile } = require('../../lib/startup/customizeApplication')

void describe('customizeApplication', () => {
  void it('should not return a filename when a custom file download fails', async (t) => {
    t.mock.method(config, 'get', () => 'https://example.com/avatar.png')

    const file = await retrieveCustomFile('application.chatBot.avatar', 'frontend/dist/frontend/assets/public/images', async () => false)

    assert.equal(file, undefined)
  })
})
