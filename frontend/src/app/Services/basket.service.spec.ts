/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { BasketService } from './basket.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('BasketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [BasketService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([BasketService], (service: BasketService) => {
    expect(service).toBeTruthy()
  }))

  it('should get basket directly from the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.find(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/basket/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get single basket item directly from the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.get(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/BasketItems/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create basket item directly from the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.save().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/BasketItems/')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should update basket item directly from the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.put(1, {}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/BasketItems/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should delete basket item directly from the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.del(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/BasketItems/1')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('DELETE')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should place order for basket via the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.checkout(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/basket/1/checkout')
      req.flush({ orderConfirmation: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should apply coupon to basket via the rest api', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      let res: any
      service.applyCoupon(1, '1234567890').subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/basket/1/coupon/1234567890')
      req.flush({ discount: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should emit total number of items when updating number of cart items', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      sessionStorage.setItem('bid', '42')
      const totals: number[] = []
      service.getItemTotal().subscribe((t) => totals.push(t))

      service.updateNumberOfCartItems()
      const req = httpMock.expectOne('http://localhost:3000/rest/basket/42')
      expect(req.request.method).toBe('GET')
      req.flush({
        data: {
          Products: [
            { BasketItem: { quantity: 2 } },
            { BasketItem: { quantity: 3 } }
          ]
        }
      })

      tick()
      expect(totals).toEqual([5])
      httpMock.verify()
    })
  ))

  it('should log error when updating number of cart items fails', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      sessionStorage.setItem('bid', '99')
      let consoleSpy: jasmine.Spy
      const anyJ = (jasmine as any)
      if (anyJ.isSpy && anyJ.isSpy(console.log as any)) {
        consoleSpy = console.log as unknown as jasmine.Spy
        consoleSpy.calls.reset()
      } else {
        consoleSpy = spyOn(console, 'log')
      }

      service.updateNumberOfCartItems()
      const req = httpMock.expectOne('http://localhost:3000/rest/basket/99')
      req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Error' })
      tick()

      expect(consoleSpy).toHaveBeenCalled()
      httpMock.verify()
    })
  ))
})
