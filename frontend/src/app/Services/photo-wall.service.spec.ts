/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { PhotoWallService } from './photo-wall.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PhotoWallService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [PhotoWallService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(PhotoWallService)

        expect(service).toBeTruthy()
    })

    it('should get memories directly from the api', () => {
        const service = TestBed.inject(PhotoWallService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.get().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/memories/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should create memories directly from the api', () => {
        const service = TestBed.inject(PhotoWallService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.addMemory('str', new File([''], 'image')).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/memories')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('POST')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting memories', () => {
        const service = TestBed.inject(PhotoWallService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.get().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/memories/')
        req.flush(null, { status: 503, statusText: 'Service Unavailable' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })

    it('should handle error when creating memory', () => {
        const service = TestBed.inject(PhotoWallService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.addMemory('str', new File([''], 'image')).subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/memories')
        req.flush(null, { status: 400, statusText: 'Bad Request' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })
})
