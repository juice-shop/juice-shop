/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import request from 'supertest'
import * as otplib from 'otplib'
import type { Express } from 'express'
import * as security from '../../../lib/insecurity'

const jsonHeader = { 'content-type': 'application/json' }

export async function login (app: Express, { email, password, totpSecret }: { email: string, password: string, totpSecret?: string }) {
  const loginRes = await request(app)
    .post('/rest/user/login')
    .set(jsonHeader)
    .send({ email, password })

  if (loginRes.status !== 200 && loginRes.body?.status !== 'totp_token_required') {
    throw new Error(`Failed to login '${email}': ${loginRes.status}`)
  }

  if (loginRes.body.status && loginRes.body.status === 'totp_token_required') {
    if (!totpSecret) {
      throw new Error('login with totp required but no totp secret provided to login function')
    }

    const totpRes = await request(app)
      .post('/rest/2fa/verify')
      .set(jsonHeader)
      .send({
        tmpToken: loginRes.body.data.tmpToken,
        totpToken: otplib.authenticator.generate(totpSecret)
      })

    return totpRes.body.authentication
  }

  return loginRes.body.authentication
}

export async function register (app: Express, { email, password, totpSecret }: { email: string, password: string, totpSecret?: string }) {
  const res = await request(app)
    .post('/api/Users/')
    .set(jsonHeader)
    .send({
      email,
      password,
      passwordRepeat: password,
      securityQuestion: null,
      securityAnswer: null
    })

  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to register '${email}': ${res.status}`)
  }

  if (totpSecret) {
    const { token } = await login(app, { email, password })

    const setupRes = await request(app)
      .post('/rest/2fa/setup')
      .set({
        Authorization: 'Bearer ' + token,
        'content-type': 'application/json'
      })
      .send({
        password,
        setupToken: security.authorize({
          secret: totpSecret,
          type: 'totp_setup_secret'
        }),
        initialToken: otplib.authenticator.generate(totpSecret)
      })

    if (setupRes.status !== 200) {
      throw new Error(`Failed to enable 2fa for user: '${email}'`)
    }
  }

  return res
}
