import { describe } from 'mocha'

/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

describe('/metrics/', () => {
  describe('challenge "exposedMetrics"', () => {
    it('Challenge is solved on accesing the api/metrics route', () => {
      browser.get('/api/metrics')
    })

    protractor.expect.challengeSolved({ challenge: 'Exposed Metrics' })
  })
})
