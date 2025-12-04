/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ComplaintService } from './complaint.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ComplaintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ComplaintService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([ComplaintService], (service: ComplaintService) => {
    expect(service).toBeTruthy()
  }))

  it('should create complaint directly via the rest api', inject([ComplaintService, HttpTestingController],
    fakeAsync((service: ComplaintService, httpMock: HttpTestingController) => {
      let res: any
      service.save(null).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Complaints/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBeNull()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when creating complaint', inject([ComplaintService, HttpTestingController],
    fakeAsync((service: ComplaintService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.save({ foo: 'bar' }).subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/api/Complaints/')
      req.flush(null, { status: 400, statusText: 'Bad Request' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(400)
      httpMock.verify()
    })
  ))
})
