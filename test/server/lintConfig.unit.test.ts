/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'

import { sortConfigFileNames } from '../../lib/scripts/lintConfig'

describe('lintConfig', () => {
  describe('sortConfigFileNames', () => {
    it('sorts file names alphabetically using localeCompare', () => {
      const input = ['zamboni.yml', 'addo.yml', 'bodgeit.yml', 'ctf.yml']
      const result = sortConfigFileNames(input)
      assert.deepStrictEqual(result, ['addo.yml', 'bodgeit.yml', 'ctf.yml', 'zamboni.yml'])
    })

    it('does not mutate the input array', () => {
      const input = ['b.yml', 'a.yml']
      sortConfigFileNames(input)
      assert.deepStrictEqual(input, ['b.yml', 'a.yml'])
    })

    it('sorts case-insensitively as expected from localeCompare', () => {
      const input = ['Beta.yml', 'alpha.yml']
      const result = sortConfigFileNames(input)
      assert.deepStrictEqual(result, ['alpha.yml', 'Beta.yml'])
    })
  })
})
