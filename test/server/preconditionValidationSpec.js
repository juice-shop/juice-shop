const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const semver = require('semver')
const { checkIfRunningOnSupportedNodeVersion } = require('../../lib/startup/validatePreconditions')

describe('preconditionValidation', () => {
  describe('checkIfRunningOnSupportedNodeVersion', () => {
    const supportedVersion = require('./../../package.json').engines.node

    it('should define the supported semver range as 8 - 11', () => {
      expect(supportedVersion).to.equal('8 - 11')
      expect(semver.validRange(supportedVersion)).to.not.equal(null)
    })

    it('should accept a supported version', () => {
expect(checkIfRunningOnSupportedNodeVersion('11.3.0')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('10.12.0')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('9.11.2')).to.equal(true)
      expect(checkIfRunningOnSupportedNodeVersion('8.12.0')).to.equal(true)
    })

    it('should fail for an unsupported version', () => {
      expect(checkIfRunningOnSupportedNodeVersion('7.10.1')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('6.14.4')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('4.9.1')).to.equal(false)
      expect(checkIfRunningOnSupportedNodeVersion('0.12.8')).to.equal(false)
    })
  })
})
