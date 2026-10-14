/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { CaptchaService } from './captcha.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('CaptchaService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [CaptchaService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(CaptchaService)

        expect(service).toBeTruthy()
    })

    it('should get captcha directly from the rest api', () => {
        const service = TestBed.inject(CaptchaService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.getCaptcha().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/captcha/')
        req.flush('apiResponse')
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting captcha', () => {
        const service = TestBed.inject(CaptchaService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getCaptcha().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/captcha/')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })
})
