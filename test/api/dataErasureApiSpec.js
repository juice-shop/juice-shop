/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/datarasure', () => {
  it('GET data-erasure page', () => {
    return frisby.get(URL + '/dataerasure')
      .expect('status', 200)
  })

  it('GET data-erasure page', () => {
    return frisby.get(URL + '/promotion')
      .expect('header', 'content-type', /text\/html/)
  })
})
