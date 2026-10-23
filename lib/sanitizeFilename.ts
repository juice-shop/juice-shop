/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const illegalRe = /[/?<>\\:*|"]/g
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i

function replaceTrailingDotsAndSpaces (str: string, replacement: string) {
  let end = str.length
  while (end > 0 && (str[end - 1] === '.' || str[end - 1] === ' ')) {
    end--
  }
  return end < str.length ? str.slice(0, end) + replacement : str
}

function truncateUtf8 (str: string, maxBytes: number) {
  const buf = Buffer.from(str, 'utf8')
  if (buf.length <= maxBytes) {
    return str
  }
  return buf.subarray(0, maxBytes).toString('utf8')
}

export interface SanitizeOptions {
  replacement?: string
}

function sanitize (input: string, replacement: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be string')
  }
  let sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
  sanitized = replaceTrailingDotsAndSpaces(sanitized, replacement)
  return truncateUtf8(sanitized, 255)
}

export const sanitizeFilename = (input: string, options?: SanitizeOptions): string => {
  const replacement = options?.replacement ?? ''
  const output = sanitize(input, replacement)
  if (replacement === '') {
    return output
  }
  return sanitize(output, '')
}

export default sanitizeFilename
