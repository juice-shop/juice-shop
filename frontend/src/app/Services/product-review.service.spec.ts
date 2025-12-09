/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ProductReviewService } from './product-review.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ProductReviewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ProductReviewService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([ProductReviewService], (service: ProductReviewService) => {
    expect(service).toBeTruthy()
  }))

  it('should get product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res: any
      service.get(42).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/products/42/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res: any
      service.create(42, { message: 'A', author: 'B' }).subscribe((data: any) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/products/42/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual({ message: 'A', author: 'B' })
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should edit product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res: any
      service.patch(null as unknown as { id: string, message: string }).subscribe((data: any) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/products/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PATCH')
      expect(req.request.body).toBe(null)
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting product reviews', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.get(42).subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/products/42/reviews')
      req.flush(null, { status: 500, statusText: 'Server Error' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(500)
      httpMock.verify()
    })
  ))

  it('should handle error when creating product review', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.create(42, { message: 'A', author: 'B' }).subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/products/42/reviews')
      req.flush(null, { status: 400, statusText: 'Bad Request' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(400)
      httpMock.verify()
    })
  ))

  it('should handle error when editing product review', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.patch(null as unknown as { id: string, message: string }).subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/products/reviews')
      req.flush(null, { status: 404, statusText: 'Not Found' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(404)
      httpMock.verify()
    })
  ))
})
