const chai = require('chai')
const expect = chai.expect

describe('utils', () => {
  const utils = require('../../lib/utils')

  describe('toSimpleIpAddress', () => {
    it('returns ipv6 address unchanged', () => {
      expect(utils.toSimpleIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.equal('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })

    it('returns ipv4 address fully specified as ipv6 unchanged', () => {
      expect(utils.toSimpleIpAddress('0:0:0:0:0:ffff:7f00:1')).to.equal('0:0:0:0:0:ffff:7f00:1')
    })

    it('returns ipv6 loopback address as ipv4 address', () => {
      expect(utils.toSimpleIpAddress('::1')).to.equal('127.0.0.1')
    })

    it('returns ipv4-mapped address as ipv4 address', () => {
      expect(utils.toSimpleIpAddress('::ffff:192.0.2.128')).to.equal('192.0.2.128')
    })
  })
})
