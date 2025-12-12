/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import config from 'config'

const URL = 'http://localhost:3000'

describe('HTTP', () => {
  it('response must contain CORS header allowing all origins', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'Access-Control-Allow-Origin', '\\*')
  })

  it('response must contain sameorigin frameguard header', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'X-Frame-Options', 'SAMEORIGIN')
  })

  it('response must contain CORS header allowing all origins', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'X-Content-Type-Options', 'nosniff')
  })

  it('response must not contain recruiting header', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'X-Recruiting', config.get('application.securityTxt.hiring'))
  })

  it('response must not contain XSS protection header', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expectNot('header', 'X-XSS-Protection')
  })

  it('unexpected path under known sub-path caught by generic error handler', () => {
    return frisby.get(URL + '/rest/x')
      .expect('status', 500)
      .expect('bodyContains', '<title>Error: Unexpected path: /rest/x</title>')
  })
})
