/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

export interface FeaturePolicyOptions {
  features?: Record<string, string[] | string>
}

export const buildFeaturePolicyHeader = (options?: FeaturePolicyOptions): string => {
  if (!options?.features) return ''
  const directives: string[] = []

  for (const [feature, allowlist] of Object.entries(options.features)) {
    const values = Array.isArray(allowlist) ? allowlist.join(' ') : allowlist
    directives.push(`${feature} ${values}`.trim())
  }

  return directives.join('; ')
}

export const featurePolicy = (options?: FeaturePolicyOptions) => {
  const headerValue = buildFeaturePolicyHeader(options)

  return (req: Request, res: Response, next: NextFunction) => {
    if (headerValue) {
      res.setHeader('Feature-Policy', headerValue)
    }
    next()
  }
}

export default featurePolicy
