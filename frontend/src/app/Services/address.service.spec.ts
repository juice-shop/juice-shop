/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { AddressService } from './address.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AddressService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AddressService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(AddressService)

        expect(service).toBeTruthy()
    })

    it('should get address directly from the api', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.get().subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get single address directly from the api', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.getById(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should create address directly from the api', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.save({}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('POST')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should update address directly from the api', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.put(1, {}).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should delete address directly from the api', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res
        service.del(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('DELETE')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting a single address', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.getById(1).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss/1')
        req.error(new ErrorEvent('Not Found'), { status: 404, statusText: 'Not Found' })
        expect(capturedError.status).toBe(404)
        httpMock.verify()
    })

    it('should handle error when getting addresses', () => {
        const service = TestBed.inject(AddressService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.get().subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Addresss')
        req.error(new ErrorEvent('Internal Server Error'), { status: 500, statusText: 'Internal Server Error' })
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })
})
