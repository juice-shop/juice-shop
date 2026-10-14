/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { OrderHistoryService } from './order-history.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('OrderHistoryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OrderHistoryService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(OrderHistoryService)

        expect(service).toBeTruthy()
    })

    it('should get payment cards directly from the api', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.get().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get payment cards directly from the api', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.getAll().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history/orders')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should update address directly from the api', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.toggleDeliveryStatus(1, {}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history/1/delivery-status')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting order history', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.get().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history')
        req.flush(null, { status: 500, statusText: 'Server Error' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when getting all orders', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getAll().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history/orders')
        req.flush(null, { status: 404, statusText: 'Not Found' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(404)
        httpMock.verify()
    })

    it('should handle error when toggling delivery status', () => {
        const service = TestBed.inject(OrderHistoryService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.toggleDeliveryStatus(1, {}).subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/order-history/1/delivery-status')
        req.flush(null, { status: 400, statusText: 'Bad Request' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })
})
