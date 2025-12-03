/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { QuantityService } from './quantity.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('QuantityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [QuantityService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([QuantityService], (service: QuantityService) => {
    expect(service).toBeTruthy()
  }))

  it('should get all quantities directly from the rest api', inject([QuantityService, HttpTestingController],
    fakeAsync((service: QuantityService, httpMock: HttpTestingController) => {
      let res
      service.getAll().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Quantitys/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should change quantity directly via the rest api', inject([QuantityService, HttpTestingController],
    fakeAsync((service: QuantityService, httpMock: HttpTestingController) => {
      let res
      service.put(42, {}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Quantitys/42')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual({})
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting all quantities', inject([QuantityService, HttpTestingController],
    fakeAsync((service: QuantityService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.getAll().subscribe({ next: () => fail('expected error'), error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/api/Quantitys/')
      req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })

      tick()
      expect(capturedError.status).toBe(500)
      httpMock.verify()
    })
  ))

  it('should handle error when updating a quantity', inject([QuantityService, HttpTestingController],
    fakeAsync((service: QuantityService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.put(7, {}).subscribe({ next: () => fail('expected error'), error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/api/Quantitys/7')
      req.error(new ErrorEvent('Request failed'), { status: 400, statusText: 'Bad Request' })

      tick()
      expect(capturedError.status).toBe(400)
      httpMock.verify()
    })
  ))
})
