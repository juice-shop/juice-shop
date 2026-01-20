
import path = require('path')
import fs = require('fs')
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
          expect(en[tagKey], `Tag "${tag}" of challenge "${challenge.name}" is missing in en.json (expected key: ${tagKey})`).to.not.equal(undefined)
        })
      }
    })
  })
})
