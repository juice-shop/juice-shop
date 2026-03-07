/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { DeliveryService } from './delivery.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('DeliveryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DeliveryService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([DeliveryService], (service: DeliveryService) => {
    expect(service).toBeTruthy()
  }))

  it('should get address directly from the api', inject([DeliveryService, HttpTestingController],
    fakeAsync((service: DeliveryService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Deliverys')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single address directly from the api', inject([DeliveryService, HttpTestingController],
    fakeAsync((service: DeliveryService, httpMock: HttpTestingController) => {
      let res
      service.getById(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Deliverys/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting delivery methods', inject([DeliveryService, HttpTestingController],
    fakeAsync((service: DeliveryService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.get().subscribe({ next: () => fail('expected error'), error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/api/Deliverys')
      req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })

      tick()
      expect(capturedError.status).toBe(500)
      httpMock.verify()
    })
  ))

  it('should handle error when getting a single delivery method', inject([DeliveryService, HttpTestingController],
    fakeAsync((service: DeliveryService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.getById(1).subscribe({ next: () => fail('expected error'), error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/api/Deliverys/1')
      req.error(new ErrorEvent('Not Found'), { status: 404, statusText: 'Not Found' })

      tick()
      expect(capturedError.status).toBe(404)
      httpMock.verify()
    })
  ))
})
