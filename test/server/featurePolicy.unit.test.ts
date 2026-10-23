/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildFeaturePolicyHeader, featurePolicy } from '../../lib/featurePolicy'

void describe('featurePolicy', () => {
  void describe('buildFeaturePolicyHeader', () => {
    void it('should format single feature directive', () => {
      const header = buildFeaturePolicyHeader({
        features: {
          payment: ["'self'"]
        }
      })
      assert.equal(header, "payment 'self'")
    })

    void it('should format multiple feature directives', () => {
      const header = buildFeaturePolicyHeader({
        features: {
          payment: ["'self'"],
          geolocation: ["'none'"]
        }
      })
      assert.equal(header, "payment 'self'; geolocation 'none'")
    })

    void it('should return empty string when no features configured', () => {
      assert.equal(buildFeaturePolicyHeader(), '')
      assert.equal(buildFeaturePolicyHeader({}), '')
    })
  })

  void describe('middleware', () => {
    void it('should set Feature-Policy header on response', () => {
      const middleware = featurePolicy({
        features: {
          payment: ["'self'"]
        }
      })
      const headers: Record<string, string> = {}
      const res = {
        setHeader: (key: string, val: string) => {
          headers[key] = val
        }
      } as any
      let nextCalled = false
      const next = () => {
        nextCalled = true
      }

      middleware({} as any, res, next)
      assert.equal(headers['Feature-Policy'], "payment 'self'")
      assert.equal(nextCalled, true)
    })
  })
})
