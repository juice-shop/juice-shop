/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import isHeroku from '../../lib/is-heroku'

void describe('isHeroku', () => {
  void it('returns true when HEROKU is set', (t) => {
    const originalHeroku = process.env.HEROKU
    const originalDyno = process.env.DYNO
    process.env.HEROKU = 'true'
    delete process.env.DYNO
    t.after(() => {
      if (originalHeroku === undefined) {
        delete process.env.HEROKU
      } else {
        process.env.HEROKU = originalHeroku
      }
      if (originalDyno === undefined) {
        delete process.env.DYNO
      } else {
        process.env.DYNO = originalDyno
      }
    })

    assert.equal(isHeroku(), true)
  })

  void it('returns true when DYNO is set and HOME is /app', (t) => {
    const originalHeroku = process.env.HEROKU
    const originalDyno = process.env.DYNO
    const originalHome = process.env.HOME
    delete process.env.HEROKU
    process.env.DYNO = 'web.1'
    process.env.HOME = '/app'
    t.after(() => {
      if (originalHeroku === undefined) {
        delete process.env.HEROKU
      } else {
        process.env.HEROKU = originalHeroku
      }
      if (originalDyno === undefined) {
        delete process.env.DYNO
      } else {
        process.env.DYNO = originalDyno
      }
      if (originalHome === undefined) {
        delete process.env.HOME
      } else {
        process.env.HOME = originalHome
      }
    })

    assert.equal(isHeroku(), true)
  })

  void it('returns false when DYNO is set but HOME is not /app', (t) => {
    const originalHeroku = process.env.HEROKU
    const originalDyno = process.env.DYNO
    const originalHome = process.env.HOME
    delete process.env.HEROKU
    process.env.DYNO = 'web.1'
    process.env.HOME = '/home/user'
    t.after(() => {
      if (originalHeroku === undefined) {
        delete process.env.HEROKU
      } else {
        process.env.HEROKU = originalHeroku
      }
      if (originalDyno === undefined) {
        delete process.env.DYNO
      } else {
        process.env.DYNO = originalDyno
      }
      if (originalHome === undefined) {
        delete process.env.HOME
      } else {
        process.env.HOME = originalHome
      }
    })

    assert.equal(isHeroku(), false)
  })

  void it('returns false when neither HEROKU nor DYNO is set', (t) => {
    const originalHeroku = process.env.HEROKU
    const originalDyno = process.env.DYNO
    delete process.env.HEROKU
    delete process.env.DYNO
    t.after(() => {
      if (originalHeroku === undefined) {
        delete process.env.HEROKU
      } else {
        process.env.HEROKU = originalHeroku
      }
      if (originalDyno === undefined) {
        delete process.env.DYNO
      } else {
        process.env.DYNO = originalDyno
      }
    })

    assert.equal(isHeroku(), false)
  })
})
