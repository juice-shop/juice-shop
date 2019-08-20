const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('currentUser', () => {
  const retrieveLoggedInUser = require('../../routes/currentUser')

  beforeEach(() => {
    this.req = { cookies: {}, query: {} }
    this.res = { json: sinon.spy() }
  })

  it('should return neither ID nor email if no cookie was present in the request headers', () => {
    this.req.cookies.token = ''

    retrieveLoggedInUser()(this.req, this.res)

    expect(this.res.json).to.have.been.calledWith({ user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })

  it('should return ID and email of user belonging to cookie from the request', () => {
    this.req.cookies.token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MSwidXNlcm5hbWUiOiIiLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwicGFzc3dvcmQiOiIwMTkyMDIzYTdiYmQ3MzI1MDUxNmYwNjlkZjE4YjUwMCIsInJvbGUiOiJhZG1pbiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6ImRlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJ1cGRhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE1NjYyMzAyMjQsImV4cCI6OTk5OTk5OTk5OX0.Y1fLaqVSSDZNsrZliv1Rp4mMTGhSZCT84pBxcGFVCS1PlhoPwBszMEUho8jmsnIU2vssrYE00hP58u5tM6StUJ1pH4LB9-SGP33f5mGPuYRthrs62UeC54sT8xmnJWh_Jhr7v91ow4vP7OPAGWXHbeDeByIR6LulZ383ZEw0cNI'
    this.req.query.callback = undefined
    require('../../lib/insecurity').authenticatedUsers.put('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MSwidXNlcm5hbWUiOiIiLCJlbWFpbCI6ImFkbWluQGp1aWNlLXNoLm9wIiwicGFzc3dvcmQiOiIwMTkyMDIzYTdiYmQ3MzI1MDUxNmYwNjlkZjE4YjUwMCIsInJvbGUiOiJhZG1pbiIsImxhc3RMb2dpbklwIjoiMC4wLjAuMCIsInByb2ZpbGVJbWFnZSI6ImRlZmF1bHQuc3ZnIiwidG90cFNlY3JldCI6IiIsImlzQWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJ1cGRhdGVkQXQiOiIyMDE5LTA4LTE5IDE1OjU2OjE1LjYyOSArMDA6MDAiLCJkZWxldGVkQXQiOm51bGx9LCJpYXQiOjE1NjYyMzAyMjQsImV4cCI6OTk5OTk5OTk5OX0.Y1fLaqVSSDZNsrZliv1Rp4mMTGhSZCT84pBxcGFVCS1PlhoPwBszMEUho8jmsnIU2vssrYE00hP58u5tM6StUJ1pH4LB9-SGP33f5mGPuYRthrs62UeC54sT8xmnJWh_Jhr7v91ow4vP7OPAGWXHbeDeByIR6LulZ383ZEw0cNI', { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: 'default.svg' } })
    retrieveLoggedInUser()(this.req, this.res)

    expect(this.res.json).to.have.been.calledWith({ user: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: 'default.svg' } })
  })
})
