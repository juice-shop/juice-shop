/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/snippet/:challenge', () => {
  it('GET code snippet retrieval for unknown challenge key throws error', () => {
    return frisby.get(URL + '/snippet/doesNotExistChallenge')
      .expect('status', 412)
      .expect('json', 'error', 'Unknown challenge key: doesNotExistChallenge')
  })

  it('GET code snippet retrieval for challenge without code snippet throws error', () => {
    return frisby.get(URL + '/snippet/easterEggLevelTwoChallenge')
      .expect('status', 404)
      .expect('json', 'error', 'No code snippet available for: easterEggLevelTwoChallenge')
  })
})
