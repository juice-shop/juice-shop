/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { expect } from 'chai'
import { type Request } from 'express'
import * as security from '../../lib/insecurity'
import { roles } from '../../lib/insecurity'
import { isAiDebuggingExploited } from '../../routes/chat'

describe('chat', () => {
  describe('isAiDebuggingExploited', () => {
    it('returns true for non-admin users when show_tool_calls cookie is set', () => {
      const req = {
        cookies: { show_tool_calls: 'true' },
        headers: {
          authorization: `Bearer ${security.authorize({ data: { role: roles.customer } })}`
        }
      } as unknown as Request

      expect(isAiDebuggingExploited(req)).to.equal(true)
    })

    it('returns false for admin users when show_tool_calls cookie is set', () => {
      const req = {
        cookies: { show_tool_calls: 'true' },
        headers: {
          authorization: `Bearer ${security.authorize({ data: { role: roles.admin } })}`
        }
      } as unknown as Request

      expect(isAiDebuggingExploited(req)).to.equal(false)
    })

    it('returns false when show_tool_calls cookie is not set', () => {
      const req = {
        cookies: {},
        headers: {
          authorization: `Bearer ${security.authorize({ data: { role: roles.customer } })}`
        }
      } as unknown as Request

      expect(isAiDebuggingExploited(req)).to.equal(false)
    })
  })
})
