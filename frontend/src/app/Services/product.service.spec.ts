/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ProductService } from './product.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ProductService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ProductService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([ProductService], (service: ProductService) => {
    expect(service).toBeTruthy()
  }))

  it('should search for products directly from the rest api', inject([ProductService, HttpTestingController],
    fakeAsync((service: ProductService, httpMock: HttpTestingController) => {
      let res: any
      service.search('1').subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/products/search?q=1')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get all products directly from the rest api', inject([ProductService, HttpTestingController],
    fakeAsync((service: ProductService, httpMock: HttpTestingController) => {
      let res: any
      service.find(null).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Products/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single product directly from the rest api', inject([ProductService, HttpTestingController],
    fakeAsync((service: ProductService, httpMock: HttpTestingController) => {
      let res: any
      service.get(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Products/1?d=' + encodeURIComponent(new Date().toDateString()))
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
