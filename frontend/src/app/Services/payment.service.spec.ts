/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { PaymentService } from './payment.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PaymentService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [PaymentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(PaymentService)

        expect(service).toBeTruthy()
    })

    it('should get payment cards directly from the api', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.get().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Cards')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get single payment card directly from the api', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.getById(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Cards/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should create payment card directly from the api', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.save({}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Cards/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('POST')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should delete payment card directly from the api', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.del(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Cards/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('DELETE')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting payment cards', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let errorResponse: any
        service.get().subscribe({ next: () => { }, error: (err) => (errorResponse = err) })
        const req = httpMock.expectOne('http://localhost:3000/api/Cards')
        req.flush(null, { status: 500, statusText: 'Server Error' })
        expect(errorResponse).toBeTruthy()
        expect(errorResponse.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when creating payment card', () => {
        const service = TestBed.inject(PaymentService)
        const httpMock = TestBed.inject(HttpTestingController)

        let errorResponse: any
        service.save({}).subscribe({ next: () => { }, error: (err) => (errorResponse = err) })
        const req = httpMock.expectOne('http://localhost:3000/api/Cards/')
        req.error(new ErrorEvent('Network'))
        expect(errorResponse).toBeTruthy()
        expect(errorResponse.error).toBeTruthy()
        httpMock.verify()
    })
})
