/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TwoFactorAuthService } from './two-factor-auth-service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('TwoFactorAuthServiceService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [],
        providers: [TwoFactorAuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }))

    it('should be created', () => {
        const service = TestBed.inject(TwoFactorAuthService)

        expect(service).toBeTruthy()
    })

    it('should verify TOTP token directly via the rest api', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        localStorage.setItem('totp_tmp_token', '000000')
        let res: any
        service.verify('123456').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/verify')
        req.flush({ authentication: 'apiResponse' })

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ tmpToken: '000000', totpToken: '123456' })
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should retrieve 2FA status directly via the rest api', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.status().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/status')
        req.flush({ setup: false })

        expect(req.request.method).toBe('GET')
        expect(req.request.params.toString()).toBeFalsy()
        expect(res).toEqual({ setup: false })
        httpMock.verify()
    })

    it('should set up 2FA directly via the rest api', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.setup('s3cr3t!', 'initialToken', 'setupToken').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/setup')
        req.flush({})

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ password: 's3cr3t!', initialToken: 'initialToken', setupToken: 'setupToken' })
        expect(res).toBe(undefined)
        httpMock.verify()
    })

    it('should disable 2FA directly via the rest api', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.disable('s3cr3t!').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/disable')
        req.flush({})

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ password: 's3cr3t!' })
        expect(res).toBe(undefined)
        httpMock.verify()
    })

    it('should handle error when verifying TOTP token', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        localStorage.setItem('totp_tmp_token', '000000')
        let capturedError: any
        service.verify('654321').subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/verify')
        req.error(new ErrorEvent('Unauthorized'), { status: 401, statusText: 'Unauthorized' })
        expect(req.request.method).toBe('POST')
        expect(capturedError.status).toBe(401)
        httpMock.verify()
    })

    it('should handle error when retrieving 2FA status', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.status().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/status')
        req.error(new ErrorEvent('Service Unavailable'), { status: 503, statusText: 'Service Unavailable' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })

    it('should handle error when setting up 2FA', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.setup('pwd', 'initial', 'setup').subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/setup')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(req.request.method).toBe('POST')
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when disabling 2FA', () => {
        const service = TestBed.inject(TwoFactorAuthService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.disable('pwd').subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/2fa/disable')
        req.error(new ErrorEvent('Forbidden'), { status: 403, statusText: 'Forbidden' })
        expect(req.request.method).toBe('POST')
        expect(capturedError.status).toBe(403)
        httpMock.verify()
    })
})
