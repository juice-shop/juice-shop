/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { SecurityQuestionService } from './security-question.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('SecurityQuestionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SecurityQuestionService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const service = TestBed.inject(SecurityQuestionService)

        expect(service).toBeTruthy()
    })

    it('should get all challenges directly from the rest api', () => {
        const service = TestBed.inject(SecurityQuestionService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.find(null).subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/api/SecurityQuestions/')
        req.flush({ data: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(req.request.params.toString()).toBeFalsy()
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should get security question by user email directly from the rest api', () => {
        const service = TestBed.inject(SecurityQuestionService)
        const httpMock = TestBed.inject(HttpTestingController)

        let res: any
        service.findBy('x@y.z').subscribe((data) => (res = data))
        const req = httpMock.expectOne('http://localhost:3000/rest/user/security-question?email=x@y.z')
        req.flush({ question: 'apiResponse' })

        expect(req.request.method).toBe('GET')
        expect(res).toBe('apiResponse')
        httpMock.verify()
    })

    it('should handle error when getting security question by user email', () => {
        const service = TestBed.inject(SecurityQuestionService)
        const httpMock = TestBed.inject(HttpTestingController)

        let capturedError: any
        service.findBy('e@x.ample').subscribe({ next: () => { throw new Error('expected error') }, error: (e) => { capturedError = e } })
        const req = httpMock.expectOne('http://localhost:3000/rest/user/security-question?email=e@x.ample')
        req.error(new ErrorEvent('Request failed'), { status: 404, statusText: 'Not Found' })
        expect(capturedError.status).toBe(404)
        httpMock.verify()
    })
})
