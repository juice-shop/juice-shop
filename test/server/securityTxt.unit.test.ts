/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatSecurityTxt, securityTxt } from '../../lib/securityTxt'

void describe('securityTxt', () => {
  void describe('formatSecurityTxt', () => {
    void it('should format standard fields correctly', () => {
      const output = formatSecurityTxt({
        contact: 'mailto:security@juice-sh.op',
        encryption: 'https://juice-sh.op/pgp-key.txt',
        acknowledgements: 'https://juice-sh.op/hall-of-fame',
        'Preferred-Languages': 'en, de',
        hiring: 'https://juice-sh.op/jobs',
        expires: 'Wed, 21 Oct 2026 07:28:00 GMT'
      })

      assert.ok(output.includes('Contact: mailto:security@juice-sh.op'))
      assert.ok(output.includes('Encryption: https://juice-sh.op/pgp-key.txt'))
      assert.ok(output.includes('Acknowledgements: https://juice-sh.op/hall-of-fame'))
      assert.ok(output.includes('Preferred-Languages: en, de'))
      assert.ok(output.includes('Hiring: https://juice-sh.op/jobs'))
      assert.ok(output.includes('Expires: Wed, 21 Oct 2026 07:28:00 GMT'))
    })

    void it('should format array values as multiple directives', () => {
      const output = formatSecurityTxt({
        contact: ['mailto:sec1@juice-sh.op', 'mailto:sec2@juice-sh.op']
      })

      assert.equal(output, 'Contact: mailto:sec1@juice-sh.op\nContact: mailto:sec2@juice-sh.op')
    })

    void it('should throw error when contact is missing', () => {
      assert.throws(() => formatSecurityTxt({ hiring: 'https://juice-sh.op/jobs' } as any), /You must include a `contact` property for security.txt/)
    })
  })

  void describe('middleware', () => {
    void it('should return an Express middleware function', () => {
      const middleware = securityTxt({ contact: 'mailto:security@juice-sh.op' })
      assert.equal(typeof middleware, 'function')
    })
  })
})
