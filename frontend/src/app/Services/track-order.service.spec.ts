/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TrackOrderService } from './track-order.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('TrackOrderService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TrackOrderService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(TrackOrderService)

        expect(service).toBeTruthy()
    })

    it('should get tracking order results directly via the rest api', () => {
        const service = TestBed.inject(TrackOrderService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.find('5267-f9cd5882f54c75a3').subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/track-order/5267-f9cd5882f54c75a3')
        req.flush('apiResponse')
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting tracking order results', () => {
        const service = TestBed.inject(TrackOrderService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.find('5267-invalid').subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/track-order/5267-invalid')
        req.flush(null, { status: 404, statusText: 'Not Found' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(404)
        httpMock.verify()
    })
})
