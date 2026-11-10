/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TagsService } from './tags.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('TagsService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [],
        providers: [TagsService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }))

    it('should be created', () => {
        const service: TagsService = TestBed.inject(TagsService)
        expect(service).toBeTruthy()
    })

    it('should get the tag groups through the rest API', () => {
        const service = TestBed.inject(TagsService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.getTagGroups().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/tags')
        req.flush({ Technology: ['Web3'] })

        expect(req.request.method).toBe('GET')
        expect(res).toEqual({ Technology: ['Web3'] })

        httpMock.verify()
    })

    it('should handle error when getting the tag groups', () => {
        const service = TestBed.inject(TagsService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getTagGroups().subscribe({ next: () => { }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/tags')
        req.flush(null, { status: 503, statusText: 'Service Unavailable' })
        expect(capturedError).toBeTruthy()
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })
})
