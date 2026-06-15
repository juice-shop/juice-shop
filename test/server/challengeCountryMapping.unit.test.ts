/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'util'
import { safeLoad } from 'js-yaml'

const readFile = promisify(fs.readFile)

const loadYamlFile = async (filename: string) => {
  const contents = await readFile(filename, { encoding: 'utf8' })
  return safeLoad(contents)
}

void describe('challengeCountryMapping', () => {
  let challenges: any
  let countryMapping: Record<string, { code: any }>
  before(async () => {
    challenges = await loadYamlFile(path.resolve('data/static/challenges.yml'))
    countryMapping = (await loadYamlFile(path.resolve('config/fbctf.yml')) as any)?.ctf?.countryMapping
  })

  void it('should have a country mapping for every challenge', async () => {
    for (const { key } of challenges) {
      assert.ok(key in countryMapping, `Challenge "${key}" does not have a country mapping.`)
    }
  })

  void it('should have unique country codes in every mapping', async () => {
    const countryCodeCounts: any = {}

    for (const key of Object.keys(countryMapping)) {
      const { code } = countryMapping[key]

      if (!Object.prototype.hasOwnProperty.call(countryCodeCounts, code)) {
        countryCodeCounts[code] = 0
      }
      countryCodeCounts[code]++
    }

    for (const key of Object.keys(countryCodeCounts)) {
      const count = countryCodeCounts[key]

      assert.equal(count, 1, `Country "${key}" is used for multiple country mappings.`)
    }
  })
})
