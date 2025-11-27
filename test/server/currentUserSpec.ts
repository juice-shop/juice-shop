/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { retrieveLoggedInUser } from '../../routes/currentUser'
import { authenticatedUsers } from '../../lib/insecurity'
import type { UserModel } from 'models/user'
const expect = chai.expect
chai.use(sinonChai)

describe('currentUser', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = { cookies: {}, query: {} }
    res = { json: sinon.spy() }
  })

  it('should return neither ID nor email if no cookie was present in the request headers', () => {
    req.cookies.token = ''

    retrieveLoggedInUser()(req, res)

    expect(res.json).to.have.been.calledWith({ user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })

  it('should return ID and email of user belonging to cookie from the request', () => {
    req.cookies.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwibGFzdExvZ2luSXAiOiIwLjAuMC4wIiwicHJvZmlsZUltYWdlIjoiL2Fzc2V0cy9wdWJsaWMvaW1hZ2VzL3VwbG9hZHMvZGVmYXVsdC5zdmcifSwiaWF0IjoxNzY0MjQ0MjY1LCJleHAiOjE3OTU4MDE4NjV9.eebwEIxIKdm-Ewrku1hKFiPu8VmxCpOWAtbbKgm_ELQ_yOCtdbOxjXFIUPIODCtg7R22HLbccgEbSIFI9b_fgT3y-dpHkjmjQQJSVy7y2ug7Lp_EBnITdL159DzMhD92DHZ3a6TeqqT4KTxF16UL5itNfkM-Fd-vmSpn56p6bEtbbNGvL0-_bjfRPCR-GJdznOykxC1HdMeBMgHOLa2GoauDEvVG_xE2rVNzqHFW3lMgjUQRbbr5YM7GTQGHaQLMTH-7JJNhfap4JmozrFppDxok3K_crjje4TV5q_YBZpkKRs25QTVzWErsQnpnCYvQNRgvLQ6owQU0M16qfI8IqQ'
    req.query.callback = undefined
    authenticatedUsers.put(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwibGFzdExvZ2luSXAiOiIwLjAuMC4wIiwicHJvZmlsZUltYWdlIjoiL2Fzc2V0cy9wdWJsaWMvaW1hZ2VzL3VwbG9hZHMvZGVmYXVsdC5zdmcifSwiaWF0IjoxNzY0MjQ0MjY1LCJleHAiOjE3OTU4MDE4NjV9.eebwEIxIKdm-Ewrku1hKFiPu8VmxCpOWAtbbKgm_ELQ_yOCtdbOxjXFIUPIODCtg7R22HLbccgEbSIFI9b_fgT3y-dpHkjmjQQJSVy7y2ug7Lp_EBnITdL159DzMhD92DHZ3a6TeqqT4KTxF16UL5itNfkM-Fd-vmSpn56p6bEtbbNGvL0-_bjfRPCR-GJdznOykxC1HdMeBMgHOLa2GoauDEvVG_xE2rVNzqHFW3lMgjUQRbbr5YM7GTQGHaQLMTH-7JJNhfap4JmozrFppDxok3K_crjje4TV5q_YBZpkKRs25QTVzWErsQnpnCYvQNRgvLQ6owQU0M16qfI8IqQ',
      { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } as unknown as UserModel }
    )
    retrieveLoggedInUser()(req, res)

    expect(res.json).to.have.been.calledWith({ user: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } })
  })
})
