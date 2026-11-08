/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import cleanupFtpFolder from '../../lib/startup/cleanupFtpFolder'

void describe('cleanupFtpFolder', () => {
  const setupFtpDir = (t: any, files: string[]) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanupFtpFolder-'))
    const cwd = process.cwd()
    t.after(() => {
      process.chdir(cwd)
      fs.rmSync(dir, { recursive: true, force: true })
    })
    fs.mkdirSync(path.join(dir, 'ftp'), { recursive: true })
    for (const file of files) {
      fs.writeFileSync(path.join(dir, 'ftp', file), 'content')
    }
    process.chdir(dir)
    return dir
  }

  void it('removes only pdf files from the ftp folder', async (t) => {
    const dir = setupFtpDir(t, ['report.pdf', 'keep.txt', 'legal.md'])

    await cleanupFtpFolder()

    assert.equal(fs.existsSync(path.join(dir, 'ftp', 'report.pdf')), false)
    assert.equal(fs.existsSync(path.join(dir, 'ftp', 'keep.txt')), true)
    assert.equal(fs.existsSync(path.join(dir, 'ftp', 'legal.md')), true)
  })

  void it('does nothing when the ftp folder holds no pdf files', async (t) => {
    const dir = setupFtpDir(t, ['keep.txt'])

    await cleanupFtpFolder()

    assert.equal(fs.existsSync(path.join(dir, 'ftp', 'keep.txt')), true)
  })

  void it('does not throw when the ftp folder is missing', async (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanupFtpFolder-'))
    const cwd = process.cwd()
    t.after(() => {
      process.chdir(cwd)
      fs.rmSync(dir, { recursive: true, force: true })
    })
    process.chdir(dir)

    await cleanupFtpFolder()
  })
})
