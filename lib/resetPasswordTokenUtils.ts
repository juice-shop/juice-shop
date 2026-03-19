/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-expect-error FIXME no typescript definitions for z85 :(
import * as z85 from 'z85'

function padForZ85 (value: string): string {
  const remainder = value.length % 4
  return remainder === 0 ? value : value.padEnd(value.length + (4 - remainder), ' ')
}

export function formatResetPasswordTokenDate (date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createResetPasswordToken (email: string, date = new Date()): string {
  const encodedEmail = z85.encode(padForZ85(email))
  const encodedDate = z85.encode(padForZ85(formatResetPasswordTokenDate(date)))
  return `${encodedEmail}${encodedDate}`
}

export function getResetPasswordTokenExpiry (date = new Date()): Date {
  const expiry = new Date(date)
  expiry.setHours(23, 59, 59, 999)
  return expiry
}
