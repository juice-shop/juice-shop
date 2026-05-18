/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { WalletService } from './wallet.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('WalletService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [WalletService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(WalletService)

        expect(service).toBeTruthy()
    })

    it('should get wallet balance directly from the api', () => {
        const service = TestBed.inject(WalletService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.get().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should update wallet balance directly from the api', () => {
        const service = TestBed.inject(WalletService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.put(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting wallet balance', () => {
        const service = TestBed.inject(WalletService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.get().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when updating wallet balance', () => {
        const service = TestBed.inject(WalletService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.put({ amount: 1 }).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })
})
