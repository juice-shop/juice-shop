/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { FeedbackService } from './feedback.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('FeedbackService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [FeedbackService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(FeedbackService)

        expect(service).toBeTruthy()
    })

    it('should get all feedback directly from the rest api', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.find(null).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('GET')
        expect(req.request.params.toString()).toBeFalsy()
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should delete feedback directly via the rest api', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.del(1).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/1')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('DELETE')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should create feedback directly via the rest api', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.save(null).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/')
        req.flush({ data: 'apiResponse' })
        expect(req.request.method).toBe('POST')
        expect(req.request.body).toBeNull()
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting all feedback', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.find(null).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/')
        req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
        expect(capturedError.status).toBe(500)
        httpMock.verify()
    })

    it('should handle error when creating feedback', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.save({ foo: 'bar' }).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/')
        req.error(new ErrorEvent('Bad Request'), { status: 400, statusText: 'Bad Request' })
        expect(capturedError.status).toBe(400)
        httpMock.verify()
    })

    it('should handle error when deleting feedback', () => {
        const service = TestBed.inject(FeedbackService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.del(1).subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/api/Feedbacks/1')
        req.error(new ErrorEvent('Not Found'), { status: 404, statusText: 'Not Found' })
        expect(capturedError.status).toBe(404)
        httpMock.verify()
    })
})
