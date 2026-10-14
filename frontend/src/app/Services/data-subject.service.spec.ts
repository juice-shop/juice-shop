/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DataSubjectService } from './data-subject.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('DataSubjectService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataSubjectService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(DataSubjectService)

        expect(service).toBeTruthy()
    })

    it('should pass the erasure request directly to the rest API', () => {
        const service = TestBed.inject(DataSubjectService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.erase({}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/user/erasure-request')
        req.flush('apiResponse')

        expect(req.request.method).toBe('POST')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should request data export directly from the rest api', () => {
        const service = TestBed.inject(DataSubjectService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.dataExport(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/user/data-export')
        req.flush('apiResponse')
        expect(req.request.method).toBe('POST')
        expect(req.request.body).toBe(1)
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when sending erasure request', () => {
        const service = TestBed.inject(DataSubjectService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.erase({ foo: 'bar' }).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/user/erasure-request')
        req.error(new ErrorEvent('Request failed'), { status: 400, statusText: 'Bad Request' })
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when requesting data export', () => {
        const service = TestBed.inject(DataSubjectService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.dataExport({ id: 1 }).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/user/data-export')
        req.error(new ErrorEvent('Request failed'), { status: 503, statusText: 'Service Unavailable' })
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })
})
