/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { PaymentService } from './payment.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PaymentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PaymentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([PaymentService], (service: PaymentService) => {
    expect(service).toBeTruthy()
  }))

  it('should get payment cards directly from the api', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Cards')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single payment card directly from the api', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let res
      service.getById(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Cards/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create payment card directly from the api', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let res
      service.save({}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Cards/')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should delete payment card directly from the api', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let res
      service.del(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Cards/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('DELETE')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting payment cards', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let errorResponse: any
      service.get().subscribe({ next: () => {}, error: (err) => (errorResponse = err) })
      const req = httpMock.expectOne('http://localhost:3000/api/Cards')
      req.flush(null, { status: 500, statusText: 'Server Error' })

      tick()
      expect(errorResponse).toBeTruthy()
      expect(errorResponse.status).toBe(500)
      httpMock.verify()
    })
  ))

  it('should handle error when creating payment card', inject([PaymentService, HttpTestingController],
    fakeAsync((service: PaymentService, httpMock: HttpTestingController) => {
      let errorResponse: any
      service.save({}).subscribe({ next: () => {}, error: (err) => (errorResponse = err) })
      const req = httpMock.expectOne('http://localhost:3000/api/Cards/')
      req.error(new ErrorEvent('Network'))

      tick()
      expect(errorResponse).toBeTruthy()
      expect(errorResponse.error).toBeTruthy()
      httpMock.verify()
    })
  ))
})
