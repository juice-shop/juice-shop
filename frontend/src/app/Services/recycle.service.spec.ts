/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { RecycleService } from './recycle.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('RecycleService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [RecycleService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(RecycleService)

        expect(service).toBeTruthy()
    })

    it('should find the recycle directly from the rest api', () => {
        const service = TestBed.inject(RecycleService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.find().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Recycles/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(req.request.params.toString()).toBeFalsy()
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should create recycle directly via the rest api', () => {
        const service = TestBed.inject(RecycleService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.save(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Recycles/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('POST')
        expect(req.request.body).toBe(1)
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when finding recycles', () => {
        const service = TestBed.inject(RecycleService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.find().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Recycles/')
        req.error(new ErrorEvent('Request failed'), { status: 503, statusText: 'Service Unavailable' })
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })
})
