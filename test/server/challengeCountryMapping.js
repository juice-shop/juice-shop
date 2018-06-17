const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const fs = require('fs')
const { safeLoad } = require('js-yaml')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

const loadYamlFile = async (filename) => {
  const contents = await readFile(filename, { encoding: 'utf8' })
  return safeLoad(contents)
}

describe('challengeCountryMapping', () => {
  it('should have a country mapping for every challenge', async () => {
    const challenges = await loadYamlFile(path.join(__dirname, '../../data/static/challenges.yml'))
    const countryMapping = (await loadYamlFile(path.join(__dirname, '../../config/fbctf.yml'))).ctf.countryMapping

    for (const {key} of challenges) {
      expect(countryMapping, `Challenge "${key}" does not have a country Mapping.`).to.have.property(key)
    }
  })
})
