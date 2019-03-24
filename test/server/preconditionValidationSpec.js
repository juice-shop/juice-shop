const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const net = require('net')
chai.use(sinonChai)
chai.use(chaiAsPromised)

const semver = require('semver')
const { checkIfRunningOnSupportedNodeVersion, checkIfPortIsAvailable } = require('../../lib/startup/validatePreconditions')

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

  describe('checkIfPortIsAvailable', () => {
    it('should resolve when port 3000 is closed', () => {
      return checkIfPortIsAvailable(3000).then((result) => {
        expect(result).to.equal(true)
      })
    })

    describe('open a server before running the test', () => {
      const testServer = net.createServer()
      before(() => {
        testServer.listen(3000)
      })

      it('should reject when port 3000 is open', () => {
        return checkIfPortIsAvailable(3000).then((result) => {
          expect(result).to.not.equal(true)
        }, (err) => {
          expect(err.message).to.equal('false')
        })
      })

      after(() => {
        testServer.close()
      })
    })
  })
})
