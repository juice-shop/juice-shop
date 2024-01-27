/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { OrderHistoryService } from './order-history.service'

describe('OrderHistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderHistoryService]
    })
  })

  it('should be created', inject([OrderHistoryService], (service: OrderHistoryService) => {
    expect(service).toBeTruthy()
  }))

  it('should get payment cards directly from the api', inject([OrderHistoryService, HttpTestingController],
    fakeAsync((service: OrderHistoryService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/order-history')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get payment cards directly from the api', inject([OrderHistoryService, HttpTestingController],
    fakeAsync((service: OrderHistoryService, httpMock: HttpTestingController) => {
      let res
      service.getAll().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/order-history/orders')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should update address directly from the api', inject([OrderHistoryService, HttpTestingController],
    fakeAsync((service: OrderHistoryService, httpMock: HttpTestingController) => {
      let res
      service.toggleDeliveryStatus(1, {}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/order-history/1/delivery-status')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
