/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const expect = chai.expect

describe('insecurity', () => {
  const security = require('../../lib/insecurity')

  describe('cutOffPoisonNullByte', () => {
    it('returns string unchanged if it contains no null byte', () => {
      expect(security.cutOffPoisonNullByte('file.exe.pdf')).to.equal('file.exe.pdf')
    })

    it('returns string up to null byte', () => {
      expect(security.cutOffPoisonNullByte('file.exe%00.pdf')).to.equal('file.exe')
    })
  })

  describe('userEmailFrom', () => {
    it('returns content of "x-user-email" header if present', () => {
      expect(security.userEmailFrom({ headers: { 'x-user-email': 'test@bla.blubb' } })).to.equal('test@bla.blubb')
    })

    it('returns undefined if header "x-user-email" is not present', () => {
      expect(security.userEmailFrom({ headers: {} })).to.equal(undefined)
      expect(security.userEmailFrom({})).to.equal(undefined)
    })
  })

  describe('generateCoupon', () => {
    const z85 = require('z85')

    it('returns base85-encoded month, year and discount as coupon code', () => {
      const coupon = security.generateCoupon(20, new Date('1980-01-02'))
      expect(coupon).to.equal('n<MiifFb4l')
      expect(z85.decode(coupon).toString()).to.equal('JAN80-20')
    })

    it('uses current month and year if not specified', () => {
      const coupon = security.generateCoupon(20)
      expect(coupon).to.equal(security.generateCoupon(20, new Date()))
    })

    it('does not encode day of month or time into coupon code', () => {
      const coupon = security.generateCoupon(10, new Date('December 01, 1999'))
      expect(coupon).to.equal(security.generateCoupon(10, new Date('December 01, 1999 01:00:00')))
      expect(coupon).to.equal(security.generateCoupon(10, new Date('December 02, 1999')))
      expect(coupon).to.equal(security.generateCoupon(10, new Date('December 31, 1999 23:59:59')))
    })
  })

  describe('discountFromCoupon', () => {
    const z85 = require('z85')

    it('returns undefined when not passing in a coupon code', () => {
      expect(security.discountFromCoupon(undefined)).to.equal(undefined)
      expect(security.discountFromCoupon(null)).to.equal(undefined)
    })

    it('returns undefined for malformed coupon code', () => {
      expect(security.discountFromCoupon('')).to.equal(undefined)
      expect(security.discountFromCoupon('x')).to.equal(undefined)
      expect(security.discountFromCoupon('___')).to.equal(undefined)
    })

    it('returns undefined for coupon code not according to expected pattern', () => {
      expect(security.discountFromCoupon(z85.encode('Test'))).to.equal(undefined)
      expect(security.discountFromCoupon(z85.encode('XXX00-10'))).to.equal(undefined)
      expect(security.discountFromCoupon(z85.encode('DEC18-999'))).to.equal(undefined)
      expect(security.discountFromCoupon(z85.encode('DEC18-1'))).to.equal(undefined)
      expect(security.discountFromCoupon(z85.encode('DEC2018-10'))).to.equal(undefined)
    })

    it('returns undefined for expired coupon code', () => {
      expect(security.discountFromCoupon(z85.encode('SEP14-50'))).to.equal(undefined)
    })

    it('returns discount from valid coupon code', () => {
      expect(security.discountFromCoupon(security.generateCoupon('05'))).to.equal(5)
      expect(security.discountFromCoupon(security.generateCoupon(10))).to.equal(10)
      expect(security.discountFromCoupon(security.generateCoupon(99))).to.equal(99)
    })
  })

  describe('authenticatedUsers', () => {
    it('returns user by associated token', () => {
      security.authenticatedUsers.put('11111', { data: { id: 1 } })

      expect(security.authenticatedUsers.get('11111')).to.deep.equal({ data: { id: 1 } })
    })

    it('returns undefined if no token is passed in', () => {
      expect(security.authenticatedUsers.get(undefined)).to.equal(undefined)
      expect(security.authenticatedUsers.get(null)).to.equal(undefined)
    })

    it('returns token by associated user', () => {
      security.authenticatedUsers.put('11111', { data: { id: 1 } })

      expect(security.authenticatedUsers.tokenOf({ id: 1 })).to.equal('11111')
    })

    it('returns undefined if no user is passed in', () => {
      expect(security.authenticatedUsers.tokenOf(undefined)).to.equal(undefined)
      expect(security.authenticatedUsers.tokenOf(null)).to.equal(undefined)
    })

    it('returns user by associated token from request', () => {
      security.authenticatedUsers.put('11111', { data: { id: 1 } })

      expect(security.authenticatedUsers.from({ headers: { authorization: 'Bearer 11111' } })).to.deep.equal({ data: { id: 1 } })
    })

    it('returns undefined if no token is present in request', () => {
      expect(security.authenticatedUsers.from({ headers: {} })).to.equal(undefined)
      expect(security.authenticatedUsers.from({})).to.equal(undefined)
    })
  })

  describe('sanitizeHtml', () => {
    it('handles empty inputs by returning their string representation', () => {
      expect(security.sanitizeHtml()).to.equal('undefined')
      expect(security.sanitizeHtml(undefined)).to.equal('undefined')
      expect(security.sanitizeHtml(null)).to.equal('null')
      expect(security.sanitizeHtml('')).to.equal('')
    })

    it('returns input unchanged for plain text input', () => {
      expect(security.sanitizeHtml('This application is horrible!')).to.equal('This application is horrible!')
    })

    it('returns input unchanged for HTML input with only harmless text formatting', () => {
      expect(security.sanitizeHtml('<strong>This</strong> application <em>is horrible</em>!')).to.equal('<strong>This</strong> application <em>is horrible</em>!')
    })

    it('returns input unchanged for HTML input with only harmless links', () => {
      expect(security.sanitizeHtml('<a href="bla.blubb">Please see here for details!</a>')).to.equal('<a href="bla.blubb">Please see here for details!</a>')
    })

    it('removes all Javascript from HTML input', () => {
      expect(security.sanitizeHtml('Sani<script>alert("ScriptXSS")</script>tizedScript')).to.equal('SanitizedScript')
      expect(security.sanitizeHtml('Sani<img src="alert("ImageXSS")"/>tizedImage')).to.equal('SanitizedImage')
      expect(security.sanitizeHtml('Sani<iframe src="alert("IFrameXSS")"></iframe>tizedIFrame')).to.equal('SanitizedIFrame')
    })

    it('can be bypassed by exploiting lack of recursive sanitization', () => {
      expect(security.sanitizeHtml('<<script>Foo</script>iframe src="javascript:alert(`xss`)">')).to.equal('<iframe src="javascript:alert(`xss`)">')
    })
  })

  describe('sanitizeLegacy', () => {
    it('returns empty string for undefined input', () => {
      expect(security.sanitizeLegacy()).to.equal('')
      expect(security.sanitizeLegacy(undefined)).to.equal('')
    })

    it('returns input unchanged for plain text input', () => {
      expect(security.sanitizeLegacy('bkimminich')).to.equal('bkimminich')
      expect(security.sanitizeLegacy('Kosh III.')).to.equal('Kosh III.')
    })

    it('removes all opening tags and subsequent character from HTML input', () => {
      expect(security.sanitizeLegacy('<h1>Hello</h1>')).to.equal('ello</h1>')
      expect(security.sanitizeLegacy('<img src="test">')).to.equal('rc="test">')
    })

    it('can be bypassed to allow working HTML payload to be returned', () => {
      expect(security.sanitizeLegacy('<<a|ascript>alert(`xss`)</script>')).to.equal('<script>alert(`xss`)</script>')
    })
  })

  describe('sanitizeSecure', () => {
    it('handles empty inputs by returning their string representation', () => {
      expect(security.sanitizeSecure()).to.equal('undefined')
      expect(security.sanitizeSecure(undefined)).to.equal('undefined')
      expect(security.sanitizeSecure(null)).to.equal('null')
      expect(security.sanitizeSecure('')).to.equal('')
    })

    it('returns input unchanged for plain text input', () => {
      expect(security.sanitizeSecure('This application is horrible!')).to.equal('This application is horrible!')
    })

    it('returns input unchanged for HTML input with only harmless text formatting', () => {
      expect(security.sanitizeSecure('<strong>This</strong> application <em>is horrible</em>!')).to.equal('<strong>This</strong> application <em>is horrible</em>!')
    })

    it('returns input unchanged for HTML input with only harmless links', () => {
      expect(security.sanitizeSecure('<a href="bla.blubb">Please see here for details!</a>')).to.equal('<a href="bla.blubb">Please see here for details!</a>')
    })

    it('removes all Javascript from HTML input', () => {
      expect(security.sanitizeSecure('Sani<script>alert("ScriptXSS")</script>tizedScript')).to.equal('SanitizedScript')
      expect(security.sanitizeSecure('Sani<img src="alert("ImageXSS")"/>tizedImage')).to.equal('SanitizedImage')
      expect(security.sanitizeSecure('Sani<iframe src="alert("IFrameXSS")"></iframe>tizedIFrame')).to.equal('SanitizedIFrame')
    })

    it('cannot be bypassed by exploiting lack of recursive sanitization', () => {
      expect(security.sanitizeSecure('Bla<<script>Foo</script>iframe src="javascript:alert(`xss`)">Blubb')).to.equal('BlaBlubb')
    })
  })

  describe('hash', () => {
    it('throws type error for for undefined input', () => {
      expect(() => security.hash()).to.throw(TypeError)
    })

    it('returns MD5 hash for any input string', () => {
      expect(security.hash('admin123')).to.equal('0192023a7bbd73250516f069df18b500')
      expect(security.hash('password')).to.equal('5f4dcc3b5aa765d61d8327deb882cf99')
      expect(security.hash('')).to.equal('d41d8cd98f00b204e9800998ecf8427e')
    })
  })

  describe('hmac', () => {
    it('throws type error for for undefined input', () => {
      expect(() => security.hmac()).to.throw(TypeError)
    })

    it('returns SHA-256 HMAC with "pa4qacea4VK9t9nGv7yZtwmj" as salt any input string', () => {
      expect(security.hmac('admin123')).to.equal('6be13e2feeada221f29134db71c0ab0be0e27eccfc0fb436ba4096ba73aafb20')
      expect(security.hmac('password')).to.equal('da28fc4354f4a458508a461fbae364720c4249c27f10fccf68317fc4bf6531ed')
      expect(security.hmac('')).to.equal('f052179ec5894a2e79befa8060cfcb517f1e14f7f6222af854377b6481ae953e')
    })
  })
})
