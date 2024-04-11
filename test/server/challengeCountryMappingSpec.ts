/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
import path from 'path'
import { promisify } from 'util'
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const fs = require('fs')
const { safeLoad } = require('js-yaml')
const readFile = promisify(fs.readFile)

const loadYamlFile = async (filename: string) => {
  const contents = await readFile(filename, { encoding: 'utf8' })
  return safeLoad(contents)
}

describe('challengeCountryMapping', () => {
  let challenges: any
  let countryMapping: Record<string, { code: any }>
  before(async () => {
    challenges = await loadYamlFile(path.resolve('data/static/challenges.yml'))
    countryMapping = (await loadYamlFile(path.resolve('config/fbctf.yml'))).ctf.countryMapping
  })
  it('should have a country mapping for every challenge', async () => {
    for (const { key } of challenges) {
      expect(countryMapping, `Challenge "${key}" does not have a country mapping.`).to.have.property(key)
    }
  })

  it('should have unique country codes in every mapping', async () => {
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

      expect(count, `Country "${key}" is used for multiple country mappings.`).to.equal(1)
    }
  })
})
