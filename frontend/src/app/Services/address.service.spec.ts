/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { AddressService } from './address.service'

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService]
    })
  })

  it('should be created', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy()
  }))

  it('should get address directly from the api', inject([AddressService, HttpTestingController],
    fakeAsync((service: AddressService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Addresss')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single address directly from the api', inject([AddressService, HttpTestingController],
    fakeAsync((service: AddressService, httpMock: HttpTestingController) => {
      let res
      service.getById(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create address directly from the api', inject([AddressService, HttpTestingController],
    fakeAsync((service: AddressService, httpMock: HttpTestingController) => {
      let res
      service.save({}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Addresss/')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should update address directly from the api', inject([AddressService, HttpTestingController],
    fakeAsync((service: AddressService, httpMock: HttpTestingController) => {
      let res
      service.put(1, {}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should delete address directly from the api', inject([AddressService, HttpTestingController],
    fakeAsync((service: AddressService, httpMock: HttpTestingController) => {
      let res
      service.del(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('DELETE')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
