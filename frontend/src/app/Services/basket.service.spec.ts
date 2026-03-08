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

  it('should store and aggregate guest basket items in session storage', inject([BasketService],
    ((service: BasketService) => {
      sessionStorage.removeItem('guestBasketItems')

      service.addGuestBasketItem(1)
      service.addGuestBasketItem(1, 2)
      service.addGuestBasketItem(2)

      expect(sessionStorage.getItem('guestBasketItems')).toBe('{"1":3,"2":1}')
    })
  ))

  it('should sync guest basket items into existing basket and clear pending data', inject([BasketService, HttpTestingController],
    fakeAsync((service: BasketService, httpMock: HttpTestingController) => {
      sessionStorage.setItem('bid', '42')
      sessionStorage.setItem('guestBasketItems', '{"1":3,"2":1}')

      service.syncGuestBasketItems()

      const basketReq = httpMock.expectOne('http://localhost:3000/rest/basket/42')
      expect(basketReq.request.method).toBe('GET')
      basketReq.flush({
        data: {
          Products: [{ id: 1, BasketItem: { id: 10, quantity: 2 } }]
        }
      })

      // Continue async flow after firstValueFrom(this.find(...)) resolves.
      tick()

      const updateReq = httpMock.expectOne('http://localhost:3000/api/BasketItems/10')
      expect(updateReq.request.method).toBe('PUT')
      expect(updateReq.request.body).toEqual({ quantity: 5 })
      updateReq.flush({ data: {} })

      tick()

      const createReq = httpMock.expectOne('http://localhost:3000/api/BasketItems/')
      expect(createReq.request.method).toBe('POST')
      expect(createReq.request.body).toEqual({ ProductId: 2, BasketId: 42, quantity: 1 })
      createReq.flush({ data: {} })

      tick()

      expect(sessionStorage.getItem('guestBasketItems')).toBeNull()
      httpMock.verify()
    })
  ))
})
