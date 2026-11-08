/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import validateDependencies from '../../lib/startup/validateDependencies'

void describe('validateDependencies', () => {
  const writePackageDir = (t: any, pkg: object, modules: Record<string, string>) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validateDependencies-'))
    t.after(() => {
      fs.rmSync(dir, { recursive: true, force: true })
    })
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg))
    for (const [name, version] of Object.entries(modules)) {
      const moduleDir = path.join(dir, 'node_modules', name)
      fs.mkdirSync(moduleDir, { recursive: true })
      fs.writeFileSync(path.join(moduleDir, 'package.json'), JSON.stringify({ version }))
    }
    return dir
  }

  void it('returns true when all dependencies are satisfied', async (t) => {
    const dir = writePackageDir(t, { dependencies: { foo: '^1.2.0' } }, { foo: '1.2.3' })

    assert.equal(await validateDependencies({ packageDir: dir }), true)
  })

  void it('returns true when there are no dependencies', async (t) => {
    const dir = writePackageDir(t, {}, {})

    assert.equal(await validateDependencies({ packageDir: dir }), true)
  })

  void it('returns false when a dependency is not installed', async (t) => {
    const dir = writePackageDir(t, { dependencies: { foo: '^1.2.0' } }, {})

    assert.equal(await validateDependencies({ packageDir: dir }), false)
  })

  void it('returns false when an installed version does not satisfy the range', async (t) => {
    const dir = writePackageDir(t, { dependencies: { foo: '^1.2.0' } }, { foo: '2.0.0' })

    assert.equal(await validateDependencies({ packageDir: dir }), false)
  })

  void it('returns false when package.json cannot be read', async (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validateDependencies-'))
    t.after(() => {
      fs.rmSync(dir, { recursive: true, force: true })
    })

    assert.equal(await validateDependencies({ packageDir: dir }), false)
  })
})
