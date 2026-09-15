/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { LanguagesService } from './languages.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('LanguagesService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [],
        providers: [LanguagesService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }))

    it('should be created', () => {
        const service: LanguagesService = TestBed.inject(LanguagesService)
        expect(service).toBeTruthy()
    })

    it('should get the language list through the rest API', () => {
        const service = TestBed.inject(LanguagesService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.getLanguages().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/languages')
        req.flush('apiResponse')

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')

        httpMock.verify()
    })

    it('should handle error when getting the language list', () => {
        const service = TestBed.inject(LanguagesService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getLanguages().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/languages')
        req.flush(null, { status: 503, statusText: 'Service Unavailable' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })
})
