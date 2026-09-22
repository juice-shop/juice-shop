/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { checkUploadSize, checkFileType, handleXmlUpload } from '../../routes/fileUpload'

void describe('fileUpload', () => {
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    req = { file: { originalname: '' } }
    res = {}
    save = () => ({
      then () { }
    })
  })

  void describe('should not solve "uploadSizeChallenge" when file size is', () => {
    const sizes = [0, 1, 100, 1000, 10000, 99999, 100000]
    sizes.forEach(size => {
      void it(`${size} bytes`, () => {
        challenges.uploadSizeChallenge = { solved: false, save } as unknown as Challenge
        req.file.size = size

        checkUploadSize(req, res, () => {})

        assert.equal(challenges.uploadSizeChallenge.solved, false)
      })
    })
  })

  void it('should solve "uploadSizeChallenge" when file size exceeds 100000 bytes', () => {
    challenges.uploadSizeChallenge = { solved: false, save } as unknown as Challenge
    req.file.size = 100001

    checkUploadSize(req, res, () => {})

    assert.equal(challenges.uploadSizeChallenge.solved, true)
  })

  void it('should solve "uploadTypeChallenge" when file type is not PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save } as unknown as Challenge
    req.file.originalname = 'hack.exe'

    checkFileType(req, res, () => {})

    assert.equal(challenges.uploadTypeChallenge.solved, true)
  })

  void it('should not solve "uploadTypeChallenge" when file type is PDF', () => {
    challenges.uploadTypeChallenge = { solved: false, save } as unknown as Challenge
    req.file.originalname = 'hack.pdf'

    checkFileType(req, res, () => {})

    assert.equal(challenges.uploadTypeChallenge.solved, false)
  })

  void it('should pass through to next() for non-XML files without touching the response', async () => {
    req.file.originalname = 'notes.pdf'
    res.status = () => { throw new Error('res.status should not be called for non-XML uploads') }
    let nextCalls = 0

    await handleXmlUpload(req, res, () => { nextCalls++ })

    assert.equal(nextCalls, 1)
  })

  void it('should reject XML uploads without a buffer with a 410 deprecation error', async () => {
    req.file.originalname = 'complaint.xml'
    req.file.buffer = undefined
    let statusCode: number | undefined
    res.status = (code: number) => { statusCode = code; return res }
    const nextArgs: unknown[] = []

    await handleXmlUpload(req, res, (err?: unknown) => { nextArgs.push(err) })

    assert.equal(statusCode, 410)
    assert.match(nextArgs[0] instanceof Error ? nextArgs[0].message : '', /deprecated for security reasons/)
  })
})
