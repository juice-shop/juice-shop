/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { UserService } from './user.service'

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
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

      const req = httpMock.expectOne('http://localhost:3000/rest/user/whoami')
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
})
