/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { HintService } from './hint.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('HintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [HintService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([HintService], (service: HintService) => {
    expect(service).toBeTruthy()
  }))

  it('should get all hints directly from the rest api', inject([HintService, HttpTestingController],
    fakeAsync((service: HintService, httpMock: HttpTestingController) => {
      let res
      service.getAll().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Hints/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should update hint directly via the rest api', inject([HintService, HttpTestingController],
    fakeAsync((service: HintService, httpMock: HttpTestingController) => {
      let res
      service.put(42, {}).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/api/Hints/42')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual({})
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
