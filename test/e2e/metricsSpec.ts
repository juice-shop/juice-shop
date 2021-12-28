/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

describe('/metrics/', () => {
  describe('challenge "exposedMetrics"', () => {
    it('Challenge is solved on accessing the /metrics route', () => {
      browser.waitForAngularEnabled(false)
      browser.get(`${protractor.basePath}/metrics`)
      browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({ challenge: 'Exposed Metrics' })
  })
})
