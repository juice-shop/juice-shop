/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

void describe('restoreOverwrittenFilesWithOriginals', () => {
  let restoreOverwrittenFilesWithOriginals: any
  beforeEach(() => {
    try {
      const modulePath = require.resolve('../../lib/startup/restoreOverwrittenFilesWithOriginals')
      delete require.cache[modulePath]
    } catch (e) {}
    restoreOverwrittenFilesWithOriginals = require('../../lib/startup/restoreOverwrittenFilesWithOriginals').default
  })

  const setupProjectDir = (t: any, files: Record<string, string>) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'restoreOriginals-'))
    const cwd = process.cwd()
    t.after(() => {
      process.chdir(cwd)
      fs.rmSync(dir, { recursive: true, force: true })
    })
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(dir, name)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, content)
    }
    process.chdir(dir)
    return dir
  }

  void it('restores legal.md and i18n files from data/static', async (t) => {
    const dir = setupProjectDir(t, {
      'data/static/legal.md': '# legal',
      'data/static/i18n/en.json': '{"key":"value"}',
      'ftp/.keep': '',
      'i18n/.keep': ''
    })

    await restoreOverwrittenFilesWithOriginals()

    assert.equal(fs.readFileSync(path.join(dir, 'ftp', 'legal.md'), 'utf8'), '# legal')
    assert.equal(fs.readFileSync(path.join(dir, 'i18n', 'en.json'), 'utf8'), '{"key":"value"}')
  })

  void it('copies the promo subtitles when frontend/dist exists', async (t) => {
    const dir = setupProjectDir(t, {
      'data/static/legal.md': '# legal',
      'data/static/owasp_promo.vtt': 'WEBVTT',
      'ftp/.keep': '',
      'frontend/dist/frontend/assets/public/videos/.keep': ''
    })

    await restoreOverwrittenFilesWithOriginals()

    assert.equal(fs.readFileSync(path.join(dir, 'frontend', 'dist', 'frontend', 'assets', 'public', 'videos', 'owasp_promo.vtt'), 'utf8'), 'WEBVTT')
  })

  void it('skips the promo subtitles when frontend/dist is missing', async (t) => {
    const dir = setupProjectDir(t, {
      'data/static/legal.md': '# legal',
      'data/static/owasp_promo.vtt': 'WEBVTT',
      'ftp/.keep': ''
    })

    await restoreOverwrittenFilesWithOriginals()

    assert.equal(fs.existsSync(path.join(dir, 'frontend')), false)
    assert.equal(fs.readFileSync(path.join(dir, 'ftp', 'legal.md'), 'utf8'), '# legal')
  })

  void it('does nothing in test env when i18n/en.json already exists', async (t) => {
    const dir = setupProjectDir(t, {
      'data/static/legal.md': '# legal',
      'ftp/.keep': '',
      'i18n/en.json': '{"kept":true}'
    })

    await restoreOverwrittenFilesWithOriginals()

    assert.equal(fs.existsSync(path.join(dir, 'ftp', 'legal.md')), false)
    assert.equal(fs.readFileSync(path.join(dir, 'i18n', 'en.json'), 'utf8'), '{"kept":true}')
  })

  void it('does not throw when sources are missing', async (t) => {
    setupProjectDir(t, { 'ftp/.keep': '' })

    await restoreOverwrittenFilesWithOriginals()
  })
})
