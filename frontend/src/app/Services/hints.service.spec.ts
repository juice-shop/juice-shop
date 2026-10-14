/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { HintService } from './hint.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('HintService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [HintService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(HintService)

        expect(service).toBeTruthy()
    })

    it('should get all hints directly from the rest api', () => {
        const service = TestBed.inject(HintService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.getAll().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Hints/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(req.request.params.toString()).toBeFalsy()
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should update hint directly via the rest api', () => {
        const service = TestBed.inject(HintService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.put(42, {}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Hints/42')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('PUT')
        expect(req.request.body).toEqual({})
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting all hints', () => {
        const service = TestBed.inject(HintService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getAll().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Hints/')
        req.flush(null, { status: 500, statusText: 'Server Error' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when updating hint', () => {
        const service = TestBed.inject(HintService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.put(42, {}).subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Hints/42')
        req.flush(null, { status: 400, statusText: 'Bad Request' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })
})
