/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { ChallengeService } from './challenge.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ChallengeService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ChallengeService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(ChallengeService)

        expect(service).toBeTruthy()
    })

    it('should get all challenges directly from the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.find().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/api/Challenges/')
        req.flush({ data: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get current continue code directly from the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.continueCode().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code')
        req.flush({ continueCode: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should pass continue code for restoring challenge progress on to the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.restoreProgress('CODE').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code/apply/CODE')
        req.flush({ data: 'apiResponse' })

        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get current "Find It" coding challenge continue code directly from the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.continueCodeFindIt().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-findIt')
        req.flush({ continueCode: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should pass "Find It" coding challenge continue code for restoring progress on to the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.restoreProgressFindIt('CODE').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-findIt/apply/CODE')
        req.flush({ data: 'apiResponse' })

        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get current "Fix It" coding challenge continue code directly from the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.continueCodeFixIt().subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-fixIt')
        req.flush({ continueCode: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should pass "Fix It" coding challenge continue code for restoring progress on to the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.restoreProgressFixIt('CODE').subscribe((data) => (res = data))

        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-fixIt/apply/CODE')
        req.flush({ data: 'apiResponse' })

        expect(req.request.method).toBe('PUT')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should repeat notification directly from the rest api', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.repeatNotification('CHALLENGE').subscribe((data) => (res = data))

        const req = httpMock.expectOne(req => req.url === 'http://localhost:3000/rest/repeat-notification')
        req.flush('apiResponse')

        expect(req.request.method).toBe('GET')
        expect(req.request.params.get('challenge')).toBe('CHALLENGE')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting all challenges', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.find().subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Challenges/')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when getting continue code', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.continueCode().subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code')
        req.error(new ErrorEvent('Request failed'), { status: 503, statusText: 'Service Unavailable' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })

    it('should handle error when getting "Find It" continue code', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.continueCodeFindIt().subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-findIt')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when getting "Fix It" continue code', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.continueCodeFixIt().subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-fixIt')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when restoring progress', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.restoreProgress('CODE').subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code/apply/CODE')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(req.request.method).toBe('PUT')
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when restoring "Find It" progress', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.restoreProgressFindIt('CODE').subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-findIt/apply/CODE')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(req.request.method).toBe('PUT')
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when restoring "Fix It" progress', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.restoreProgressFixIt('CODE').subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/continue-code-fixIt/apply/CODE')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(req.request.method).toBe('PUT')
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when repeating a notification', () => {
        const service = TestBed.inject(ChallengeService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.repeatNotification('X').subscribe({ next: () => { throw new Error('expected error') }, error: e => { capturedError = e } })
        const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/rest/repeat-notification')
        req.error(new ErrorEvent('Service Unavailable'), { status: 503, statusText: 'Service Unavailable' })
        expect(req.request.method).toBe('GET')
        expect(capturedError.status).toBe(503)
        httpMock.verify()
    })
})
