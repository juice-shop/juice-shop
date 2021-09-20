/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const fs = require('fs')
const path = require('path')
const URL = 'http://localhost:3000'
const API_URL = 'http://localhost:3000/metrics'

describe('/metrics', () => {
  it('GET metrics via public API that are available instantaneously', () => {
    return frisby.get(API_URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/plain/)
      .expect('bodyContains', /^.*_version_info{version="[0-9]+.[0-9]+.[0-9]+(-SNAPSHOT)?",major="[0-9]+",minor="[0-9]+",patch="[0-9]+",app=".*"} 1$/gm)
      .expect('bodyContains', /^.*_challenges_solved{difficulty="[1-6]",category=".*",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_challenges_total{difficulty="[1-6]",category=".*",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_cheat_score{app=".*"} [0-9.]*$/gm)
      .expect('bodyContains', /^.*_orders_placed_total{app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_users_registered{type="standard",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_users_registered{type="deluxe",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_users_registered_total{app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_wallet_balance_total{app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_user_social_interactions{type="review",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_user_social_interactions{type="feedback",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^.*_user_social_interactions{type="complaint",app=".*"} [0-9]*$/gm)
      .expect('bodyContains', /^http_requests_count{status_code="[0-9]XX",app=".*"} [0-9]*$/gm)
  })

  it('GET file upload metrics via public API', () => {
    const file = path.resolve(__dirname, '../files/validSizeAndTypeForClient.pdf')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 204)
      .then(() => {
        return frisby.get(API_URL)
          .expect('status', 200)
          .expect('header', 'content-type', /text\/plain/)
          .expect('bodyContains', /^file_uploads_count{file_type=".*",app=".*"} [0-9]*$/gm)
      })
  })

  it('GET file upload error metrics via public API', () => {
    const file = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
    const form = frisby.formData()
    form.append('file', fs.createReadStream(file))

    return frisby.post(URL + '/file-upload', { headers: { 'Content-Type': form.getHeaders()['content-type'] }, body: form })
      .expect('status', 500)
      .then(() => {
        return frisby.get(API_URL)
          .expect('status', 200)
          .expect('header', 'content-type', /text\/plain/)
          .expect('bodyContains', /^file_upload_errors{file_type=".*",app=".*"} [0-9]*$/gm)
      })
  })
})
