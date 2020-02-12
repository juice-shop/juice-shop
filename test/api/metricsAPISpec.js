/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const frisby = require('frisby')
const METRICS_URL = 'http://localhost:3000/metrics/'

describe('Metrics API', () => {
  it('check if /metrics endpoint is accessible', () => {
    return frisby.get(METRICS_URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/plain/)
      .expect('bodyContains', /^.*_users_registered_total{app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_challenges_solved_total{app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_orders_placed_total{app=".*"} [0-9]*$/gm)
  })
})
