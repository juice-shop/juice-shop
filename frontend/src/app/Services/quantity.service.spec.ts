/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { QuantityService } from './quantity.service'

describe('QuantityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuantityService]
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
})
