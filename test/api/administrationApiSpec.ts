/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const Joi = frisby.Joi
const utils = require('../../lib/utils')

const REST_URL = 'http://localhost:3000/rest/admin'

describe('/rest/admin/application-version', () => {
  it('GET application version from package.json', () => {
    return frisby.get(REST_URL + '/application-version')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        version: utils.version()
      })
  })
})

describe('/rest/admin/application-configuration', () => {
  it('GET application configuration', () => {
    return frisby.get(REST_URL + '/application-configuration')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        config: Joi.object()
      })
  })
})
