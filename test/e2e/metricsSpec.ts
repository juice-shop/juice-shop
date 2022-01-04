/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser, protractor } from 'protractor'

describe('/metrics/', () => {
  describe('challenge "exposedMetrics"', () => {
    it('Challenge is solved on accessing the /metrics route', () => {
      void browser.waitForAngularEnabled(false)
      void browser.get(`${protractor.basePath}/metrics`)
      void browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({ challenge: 'Exposed Metrics' })
  })
})
