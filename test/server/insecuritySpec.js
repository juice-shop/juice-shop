const chai = require('chai')
const expect = chai.expect

describe('insecurity', () => {
  const insecurity = require('../../lib/insecurity')

  describe('cutOffPoisonNullByte', () => {
    it('returns string unchanged if it contains no null byte', () => {
      expect(insecurity.cutOffPoisonNullByte('file.exe.pdf')).to.equal('file.exe.pdf')
    })

    it('returns string up to null byte', () => {
      expect(insecurity.cutOffPoisonNullByte('file.exe%00.pdf')).to.equal('file.exe')
    })
  })

  describe('userEmailFrom', () => {
    it('returns content of "x-user-email" header if present', () => {
      expect(insecurity.userEmailFrom({headers: {'x-user-email': 'test@bla.blubb'}})).to.equal('test@bla.blubb')
    })

    it('returns undefined if header "x-user-email" is not present', () => {
      expect(insecurity.userEmailFrom({headers: {}})).to.equal(undefined)
      expect(insecurity.userEmailFrom({})).to.equal(undefined)
    })
  })

  describe('generateCoupon', () => {
    const z85 = require('z85')

    it('returns base85-encoded month, year and discount as coupon code', () => {
      const coupon = insecurity.generateCoupon(new Date('1980-01-01'), 20)
      expect(coupon).to.equal('n<MiifFb4l')
      expect(z85.decode(coupon).toString()).to.equal('JAN80-20')
    })

    it('does not encode day of month or time into coupon code', () => {
      const coupon = insecurity.generateCoupon(new Date('December 01, 1999'), 10)
      expect(coupon).to.equal(insecurity.generateCoupon(new Date('December 01, 1999 01:00:00'), 10))
      expect(coupon).to.equal(insecurity.generateCoupon(new Date('December 02, 1999'), 10))
      expect(coupon).to.equal(insecurity.generateCoupon(new Date('December 31, 1999 23:59:59'), 10))
    })
  })
})
