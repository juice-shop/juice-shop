/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { browser } from 'protractor'
import { basePath, expectChallengeSolved } from './e2eHelpers'

describe('/metrics/', () => {
  describe('challenge "exposedMetrics"', () => {
    it('Challenge is solved on accessing the /metrics route', () => {
      void browser.waitForAngularEnabled(false)
      void browser.get(`${basePath}/metrics`)
      void browser.waitForAngularEnabled(true)
    })

    expectChallengeSolved({ challenge: 'Exposed Metrics' })
  })
})
