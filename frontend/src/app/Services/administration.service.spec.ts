/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { AdministrationService } from './administration.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AdministrationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(AdministrationService)

        expect(service).toBeTruthy()
    })

    it('should get application version directly from the rest api', () => {
        const service = TestBed.inject(AdministrationService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.getApplicationVersion().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-version')
        req.flush({ version: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting application version', () => {
        const service = TestBed.inject(AdministrationService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getApplicationVersion().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-version')
        req.flush(null, { status: 500, statusText: 'Server Error' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })
})
