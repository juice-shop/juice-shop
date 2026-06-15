/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

void describe('isDocker', () => {
  let isDocker: any
  beforeEach(() => {
    try {
      const path = require.resolve('../../lib/is-docker')
      delete require.cache[path]
    } catch (e) {}
    isDocker = require('../../lib/is-docker').default
  })

  void it('should return false if no docker markers are present', (t) => {
    t.mock.method(fs, 'statSync', () => { throw new Error() })
    t.mock.method(fs, 'readFileSync', () => { throw new Error() })

    assert.equal(isDocker(), false)
  })

  void it('should return true if /.dockerenv exists', (t) => {
    t.mock.method(fs, 'statSync', (path: string) => {
      if (path === '/.dockerenv') return {} as fs.Stats
      throw new Error()
    })

    assert.equal(isDocker(), true)
  })

  void it('should return true if /proc/self/cgroup contains "docker"', (t) => {
    t.mock.method(fs, 'readFileSync', (path: string) => {
      if (path === '/proc/self/cgroup') return '...docker...'
      throw new Error()
    })

    assert.equal(isDocker(), true)
  })

  void it('should return true if /proc/self/mountinfo contains "/docker/containers/"', (t) => {
    t.mock.method(fs, 'readFileSync', (path: string) => {
      if (path === '/proc/self/mountinfo') return '.../docker/containers/...'
      throw new Error()
    })

    assert.equal(isDocker(), true)
  })
})
