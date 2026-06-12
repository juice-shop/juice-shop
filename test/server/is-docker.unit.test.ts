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

  void it('should return false if no docker markers are present', () => {
    // Mock fs to return false for all checks
    const statSync = fs.statSync
    const readFileSync = fs.readFileSync
    
    fs.statSync = (path: string) => { throw new Error() }
    fs.readFileSync = (path: string) => { throw new Error() }
    
    try {
      assert.equal(isDocker(), false)
    } finally {
      fs.statSync = statSync
      fs.readFileSync = readFileSync
    }
  })

  void it('should return true if /.dockerenv exists', () => {
    const statSync = fs.statSync
    fs.statSync = (path: any) => {
      if (path === '/.dockerenv') return {} as any
      throw new Error()
    }
    try {
      assert.equal(isDocker(), true)
    } finally {
      fs.statSync = statSync
    }
  })

  void it('should return true if /proc/self/cgroup contains "docker"', () => {
    const readFileSync = fs.readFileSync
    fs.readFileSync = (path: any, encoding: any) => {
      if (path === '/proc/self/cgroup') return '...docker...'
      throw new Error()
    }
    try {
      assert.equal(isDocker(), true)
    } finally {
      fs.readFileSync = readFileSync
    }
  })

  void it('should return true if /proc/self/mountinfo contains "/docker/containers/"', () => {
    const readFileSync = fs.readFileSync
    fs.readFileSync = (path: any, encoding: any) => {
      if (path === '/proc/self/mountinfo') return '.../docker/containers/...'
      throw new Error()
    }
    try {
      assert.equal(isDocker(), true)
    } finally {
      fs.readFileSync = readFileSync
    }
  })
})
