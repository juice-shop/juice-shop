/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { serveQuarantineFiles } from '../../routes/quarantineServer'

void describe('quarantineServer', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { params: {}, query: {} }
    res = { sendFile: mock.fn(), status: mock.fn() }
    next = mock.fn()
  })

  void it('should serve the requested file from the quarantine directory', () => {
    req.params.file = 'malware.exe'

    serveQuarantineFiles()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 1)
    assert.match(res.sendFile.mock.calls[0].arguments[0], /ftp[/\\]quarantine[/\\]malware\.exe$/)
    assert.equal(next.mock.calls.length, 0)
  })

  void it('should reject file names containing forward slashes with 403', () => {
    req.params.file = '../../package.json'

    serveQuarantineFiles()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 0)
    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 403)
    assert.equal(next.mock.calls.length, 1)
    assert.equal(next.mock.calls[0].arguments[0].message, 'File names cannot contain forward slashes!')
  })

  void it('should reject nested paths with 403', () => {
    req.params.file = 'subdir/malware.exe'

    serveQuarantineFiles()(req, res, next)

    assert.equal(res.sendFile.mock.calls.length, 0)
    assert.equal(res.status.mock.calls[0].arguments[0], 403)
    assert.equal(next.mock.calls.length, 1)
  })
})
