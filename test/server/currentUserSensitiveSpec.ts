/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { retrieveLoggedInUser } from '../../routes/currentUser'
import { authenticatedUsers } from '../../lib/insecurity'
const expect = chai.expect
chai.use(sinonChai)

describe('currentUser sensitive output (dev-only)', () => {
  let req: any
  let res: any
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJkYXRhIjp7ImlkIjoxLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwibGFzdExvZ2luSXAiOiIwLjAuMC4wIiwicHJvZmlsZUltYWdlIjoiZGVmYXVsdC5zdmcifSwiaWF0IjoxNTgyMjIyMzY0fQ.CHiFQieZudYlrd1o8Ih-Izv7XY_WZupt8Our-CP9HqsczyEKqrWC7wWguOgVuSGDN_S3mP4FyuEFN8l60aAhVsUbqzFetvJkFwe5nKVhc9dHuen6cujQLMcTlHLKassOSDP41Q-MkKWcUOQu0xUkTMfEq2hPMHpMosDb4benzH0'
  let originalNodeEnv: string | undefined
  let originalEnableSensitiveApi: string | undefined
  beforeEach(() => {
    // backup env vars used by the feature
    originalNodeEnv = process.env.NODE_ENV
    originalEnableSensitiveApi = process.env.ENABLE_SENSITIVE_API
    process.env.NODE_ENV = 'development'
    process.env.ENABLE_SENSITIVE_API = 'true'
    req = { cookies: {}, query: {}, headers: {} }
    res = { json: sinon.spy(), jsonp: sinon.spy() }
  })

  afterEach(() => {
    // restore env
    process.env.NODE_ENV = originalNodeEnv
    process.env.ENABLE_SENSITIVE_API = originalEnableSensitiveApi
  })

  it('should include password when fields parameter explicitly requests it', () => {
    req.cookies.token = token
    req.query.fields = 'id,email,password'
    authenticatedUsers.put(token, { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg', password: 'deadbeef' } as unknown as any })
    retrieveLoggedInUser()(req, res)
    void expect(res.json).to.have.been.called
    const calledWith = (res.json as sinon.SinonSpy).getCall(0).args[0]
    void expect(calledWith).to.have.property('user')
    void expect(calledWith.user).to.have.property('password', 'deadbeef')
  })

  it('should not include password when fields parameter is missing', () => {
    req.cookies.token = token
    // no fields param
    authenticatedUsers.put(token, { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg', password: 'deadbeef' } as unknown as any })
    retrieveLoggedInUser()(req, res)
    void expect(res.json).to.have.been.called
    const calledWith = (res.json as sinon.SinonSpy).getCall(0).args[0]
    void expect(calledWith.user).to.not.have.property('password')
  })
})
