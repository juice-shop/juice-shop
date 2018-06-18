import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing'

import { ProductReviewService } from './product-review.service'

describe('ProductReviewService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductReviewService]
    })
  })

  it('should be created', inject([ProductReviewService], (service: ProductReviewService) => {
    expect(service).toBeTruthy()
  }))

  it('should get product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res
      service.get(42).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/product/42/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res
      service.create(42,{}).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/product/42/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual({})
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should edit product reviews directly via the rest api', inject([ProductReviewService, HttpTestingController],
    fakeAsync((service: ProductReviewService, httpMock: HttpTestingController) => {
      let res
      service.patch(null).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/product/reviews')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PATCH')
      expect(req.request.body).toBe(null)
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
