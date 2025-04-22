/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
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
})
