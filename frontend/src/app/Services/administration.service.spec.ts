/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { AdministrationService } from './administration.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AdministrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AdministrationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([AdministrationService], (service: AdministrationService) => {
    expect(service).toBeTruthy()
  }))

  it('should get application version directly from the rest api', inject([AdministrationService, HttpTestingController],
    fakeAsync((service: AdministrationService, httpMock: HttpTestingController) => {
      let res: any
      service.getApplicationVersion().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-version')
      req.flush({ version: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
