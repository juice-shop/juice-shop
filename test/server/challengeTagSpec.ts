/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'path'
import fs from 'fs'
import { load } from 'js-yaml'
import { expect } from 'chai'

const challenges = load(fs.readFileSync(path.resolve(__dirname, '../../data/static/challenges.yml'), 'utf8'))
const en = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/src/assets/i18n/en.json'), 'utf8'))

describe('Challenge Tags', () => {
  it('should be present in en.json', () => {
    challenges.forEach((challenge: any) => {
      if (challenge.tags) {
        challenge.tags.forEach((tag: string) => {
          const tagKey = `TAG_${tag.toUpperCase().replace(/\s/g, '_')}`
          expect(en[tagKey], `Challenge "${challenge.name}" uses invalid tag "${tag}". All tags must be defined in generic keys starting with "TAG_" in "i18n/en.json". Expected key: "${tagKey}"`).to.not.equal(undefined)
        })
      }
    })
  })
})
