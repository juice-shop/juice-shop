/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { PasskeyService } from './passkey.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PasskeyService', () => {
    let service: PasskeyService
    let httpMock: HttpTestingController

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [PasskeyService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
        service = TestBed.inject(PasskeyService)
        httpMock = TestBed.inject(HttpTestingController)
    })

    afterEach(() => {
        httpMock.verify()
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })

    it('should request discoverable login options without an email via the rest api', () => {
        let res: any
        service.loginOptions().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/login-options')
        req.flush({ options: { challenge: 'c' }, authToken: 'a' })

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({})
        expect(res).toEqual({ options: { challenge: 'c' }, authToken: 'a' })
    })

    it('should pass the email when requesting login options for a specific user', () => {
        service.loginOptions('a@a').subscribe()

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/login-options')
        req.flush({ options: {}, authToken: 'a' })

        expect(req.request.body).toEqual({ email: 'a@a' })
    })

    it('should verify a login assertion and return the authentication via the rest api', () => {
        let res: any
        service.loginVerify({ id: 'cred' } as any, 'authToken').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/login-verify')
        req.flush({ authentication: { token: 't', bid: 1, umail: 'a@a' } })

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ assertion: { id: 'cred' }, authToken: 'authToken' })
        expect(res).toEqual({ token: 't', bid: 1, umail: 'a@a' })
    })

    it('should request registration options via the rest api', () => {
        let res: any
        service.registerOptions().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/register-options')
        req.flush({ options: { challenge: 'c' }, regToken: 'r' })

        expect(req.request.method).toBe('GET')
        expect(res).toEqual({ options: { challenge: 'c' }, regToken: 'r' })
    })

    it('should verify a registration attestation via the rest api', () => {
        let res: any = 'unset'
        service.registerVerify({ id: 'cred' } as any, 'regToken').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/register-verify')
        req.flush({ verified: true })

        expect(req.request.method).toBe('POST')
        expect(req.request.body).toEqual({ attestation: { id: 'cred' }, regToken: 'regToken' })
        expect(res).toBe(undefined)
    })

    it('should list the credentials of the current user via the rest api', () => {
        let res: any
        service.listCredentials().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/credentials')
        req.flush({ data: [{ id: 1, credentialID: 'cred', transports: 'internal' }] })

        expect(req.request.method).toBe('GET')
        expect(res).toEqual([{ id: 1, credentialID: 'cred', transports: 'internal' }])
    })

    it('should delete a credential via the rest api', () => {
        let res: any = 'unset'
        service.deleteCredential(42).subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/credentials/42')
        req.flush(null, { status: 204, statusText: 'No Content' })

        expect(req.request.method).toBe('DELETE')
        expect(res).toBe(undefined)
    })

    it('should pass on errors when verifying a login assertion', () => {
        let capturedError: any
        service.loginVerify({ id: 'cred' } as any, 'authToken').subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/login-verify')
        req.error(new ErrorEvent('Unauthorized'), { status: 401, statusText: 'Unauthorized' })

        expect(capturedError.status).toBe(401)
    })

    it('should reject the authentication ceremony when the browser does not support WebAuthn', async () => {
        await expect(service.createAssertion({ challenge: 'c' } as any)).rejects.toThrow(/WebAuthn is not supported/)
    })

    it('should reject the registration ceremony when the browser does not support WebAuthn', async () => {
        await expect(service.createAttestation({ challenge: 'c' } as any)).rejects.toThrow(/WebAuthn is not supported/)
    })

    it('should pass on errors when listing credentials', () => {
        let capturedError: any
        service.listCredentials().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })

        const req = httpMock.expectOne('http://localhost:3000/rest/passkey/credentials')
        req.error(new ErrorEvent('Unauthorized'), { status: 401, statusText: 'Unauthorized' })

        expect(capturedError.status).toBe(401)
    })
})
