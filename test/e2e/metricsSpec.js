/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

describe('/metrics/', () => {
  describe('challenge "exposedMetrics"', () => {
    it('Challenge is solved on accessing the /metrics route', () => {
      browser.get('/metrics')
    })

    protractor.expect.challengeSolved({ challenge: 'Exposed Metrics' })
  })
})
