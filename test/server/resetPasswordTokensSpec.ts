/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { expect } from 'chai'
import { createResetPasswordToken } from '../../lib/resetPasswordTokenUtils'

describe('resetPasswordTokens', () => {
  it('keeps the beginning of the token stable for the same user across different dates', () => {
    const first = createResetPasswordToken('admin@juice-sh.op', new Date('2026-03-18T12:00:00.000Z'))
    const second = createResetPasswordToken('admin@juice-sh.op', new Date('2026-03-19T12:00:00.000Z'))

    expect(first.substring(0, 25)).to.equal(second.substring(0, 25))
  })

  it('keeps the end of the token stable for different users on the same date', () => {
    const first = createResetPasswordToken('jim@juice-sh.op', new Date('2026-03-19T12:00:00.000Z'))
    const second = createResetPasswordToken('bender@juice-sh.op', new Date('2026-03-19T12:00:00.000Z'))

    expect(first.slice(-15)).to.equal(second.slice(-15))
  })
})
