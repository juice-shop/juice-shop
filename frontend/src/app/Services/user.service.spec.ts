/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { UserService } from './user.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [UserService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy()
  }))

  it('should get all users directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.find().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/user/authentication-details/')
      req.flush({ data: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single users directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.get(1).subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/api/Users/1')
      req.flush({ data: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create user directly via the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.save(null).subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/api/Users/')
      req.flush({ data: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBeNull()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should login user directly via the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.login(null).subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/user/login')
      req.flush({ authentication: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBeNull()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should change user password directly via the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.changePassword({ current: 'foo', new: 'bar', repeat: 'bar' }).subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/user/change-password?current=foo&new=bar&repeat=bar')
      req.flush({ user: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should return the logged-in users identity directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.whoAmI().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/user/whoami?showSensitive=false')
      req.flush({ user: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should reset the password directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      const mockObject = { req: 'apiRequest' }
      service.resetPassword(mockObject).subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/user/reset-password')
      req.flush({ user: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(mockObject)
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get users deluxe status directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res
      service.deluxeStatus().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/deluxe-membership')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should upgrade users deluxe status directly from the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res
      service.upgradeToDeluxe('wallet', null).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/deluxe-membership')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should fetch user info from Google via oauthLogin', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.oauthLogin('at').subscribe((data) => (res = data))

      const req = httpMock.expectOne('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=at')
      req.flush({ id: '123' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toEqual({ id: '123' })
      httpMock.verify()
    })
  ))

  it('should save last login ip via the rest api', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let res: any
      service.saveLastLoginIp().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/saveLoginIp')
      req.flush({})
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toEqual({})
      httpMock.verify()
    })
  ))

  // Added: error handling tests to UserService spec to cover error wording convention
  it('should handle error when login fails', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let errorResponse: any
      service.login(null).subscribe({ next: () => {}, error: (err) => (errorResponse = err) })
      const req = httpMock.expectOne('http://localhost:3000/rest/user/login')
      req.flush({ message: 'Invalid' }, { status: 401, statusText: 'Unauthorized' })

      tick()
      expect(errorResponse).toBeTruthy()
      expect(errorResponse.status).toBe(401)
      httpMock.verify()
    })
  ))

  it('should handle error when fetching whoAmI', inject([UserService, HttpTestingController],
    fakeAsync((service: UserService, httpMock: HttpTestingController) => {
      let errorResponse: any
      service.whoAmI().subscribe({ next: () => {}, error: (err) => (errorResponse = err) })
      const req = httpMock.expectOne('http://localhost:3000/rest/user/whoami?showSensitive=false')
      req.error(new ErrorEvent('Network'))

      tick()
      expect(errorResponse).toBeTruthy()
      expect(errorResponse.error).toBeTruthy()
      httpMock.verify()
    })
  ))
})
