/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import config, { type IConfig } from 'config'
import { countryMapping } from '../../routes/countryMapping'

void describe('countryMapping', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = { send: mock.fn(), status: mock.fn(() => ({ send: mock.fn() })) }
  })

  void it('should return configured country mappings', () => {
    countryMapping({ get: mock.fn((key: string) => key === 'ctf.countryMapping' ? 'TEST' : undefined) } as unknown as IConfig)(req, res)

    assert.equal(res.send.mock.calls.length, 1)
    assert.equal(res.send.mock.calls[0].arguments[0], 'TEST')
  })

  void it('should return server error when configuration has no country mappings', () => {
    countryMapping({ get: mock.fn((key: string) => key === 'ctf.countryMapping' ? null : undefined) } as unknown as IConfig)(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 500)
  })

  void it('should return ' + (config.get('ctf.countryMapping') ? 'no ' : '') + 'server error for active configuration from config/' + process.env.NODE_ENV + '.yml', () => {
    countryMapping()(req, res)

    if (config.get('ctf.countryMapping')) {
      assert.equal(res.send.mock.calls.length, 1)
      assert.deepEqual(res.send.mock.calls[0].arguments[0], config.get('ctf.countryMapping'))
    } else {
      assert.equal(res.status.mock.calls.length, 1)
      assert.equal(res.status.mock.calls[0].arguments[0], 500)
    }
  })
})
