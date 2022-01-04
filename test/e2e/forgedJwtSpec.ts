/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import utils = require('../../lib/utils')
import { browser, protractor } from 'protractor'

describe('/', () => {
  describe('challenge "jwtUnsigned"', () => {
    it('should accept an unsigned token with email jwtn3d@juice-sh.op in the payload ', () => {
      void browser.executeScript('localStorage.setItem("token", "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.")')
      void browser.get(`${protractor.basePath}/#/`)
    })

    protractor.expect.challengeSolved({ challenge: 'Unsigned JWT' })
  })

  if (!utils.disableOnWindowsEnv()) {
    describe('challenge "jwtForged"', () => {
      it('should accept a token HMAC-signed with public RSA key with email rsa_lord@juice-sh.op in the payload ', () => {
        void browser.executeScript('localStorage.setItem("token", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTgzMDM3NzExfQ.gShXDT5TrE5736mpIbfVDEcQbLfteJaQUG7Z0PH8Xc8")')
        void browser.get(`${protractor.basePath}/#/`)
      })

      protractor.expect.challengeSolved({ challenge: 'Forged Signed JWT' })
    })
  }
})
