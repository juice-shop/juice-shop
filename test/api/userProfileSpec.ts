/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const config = require('config')

const URL = 'http://localhost:3000'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader

beforeAll(() => {
  return frisby.post(`${URL}/rest/user/login`, {
    headers: jsonHeader,
    body: {
      email: 'jim@juice-sh.op',
      password: 'ncc-1701'
    }
  })
    .expect('status', 200)
    .then(({ json }) => {
      authHeader = { Cookie: `token=${json.authentication.token}` }
    })
})

describe('/profile', () => {
  it('GET user profile is forbidden for unauthenticated user', () => {
    return frisby.get(`${URL}/profile`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'Error: Blocked illegal activity')
  })

  it('GET user profile of authenticated user', () => {
    return frisby.get(`${URL}/profile`, {
      headers: authHeader
    })
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'id="email" type="email" name="email" value="jim@juice-sh.op"')
  })

  it('POST update username of authenticated user', () => {
    const form = frisby.formData()
    form.append('username', 'Localhorst')

    return frisby.post(`${URL}/profile`, {
      headers: { 'Content-Type': form.getHeaders()['content-type'], Cookie: authHeader.Cookie },
      body: form,
      redirect: 'manual'
    })
      .expect('status', 302)
  })

  xit('POST update username is forbidden for unauthenticated user', () => { // FIXME runs into "socket hang up"
    const form = frisby.formData()
    form.append('username', 'Localhorst')

    return frisby.post(`${URL}/profile`, {
      headers: { 'Content-Type': form.getHeaders()['content-type'] },
      body: form
    })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'Error: Blocked illegal activity')
  })
})
