/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'

export interface SecurityTxtOptions {
  contact?: string | string[]
  encryption?: string | string[]
  acknowledgements?: string | string[]
  'Preferred-Languages'?: string | string[]
  preferredLanguages?: string | string[]
  hiring?: string | string[]
  csaf?: string | string[]
  expires?: string | string[]
  [key: string]: string | string[] | undefined
}

const normalizeCase = (str: string): string => {
  if (str.toLowerCase() === 'preferred-languages') {
    return 'Preferred-Languages'
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatSecurityTxt = (fields: SecurityTxtOptions): string => {
  const keys = Object.keys(fields)
  const normalizedKeys = keys.map((k) => normalizeCase(k))
  if (!normalizedKeys.includes('Contact')) {
    throw new Error('You must include a `contact` property for security.txt')
  }

  const lines: string[] = []
  for (const directive of keys) {
    const value = fields[directive]
    if (value === undefined || value === null) continue
    const key = normalizeCase(directive)
    const values = Array.isArray(value) ? value : [value]
    for (const val of values) {
      lines.push(`${key}: ${val}`)
    }
  }

  return lines.join('\n')
}

export const securityTxt = (fields: SecurityTxtOptions) => {
  const content = formatSecurityTxt(fields)

  return (req: Request, res: Response) => {
    res.header('Content-Type', 'text/plain')
    res.send(content)
  }
}

export default securityTxt
