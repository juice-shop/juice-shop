/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { CountryMappingService } from './country-mapping.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('CountryMappingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CountryMappingService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([CountryMappingService], (service: CountryMappingService) => {
    expect(service).toBeTruthy()
  }))

  it('should get the country mapping directly through the rest API', inject([CountryMappingService, HttpTestingController],
    fakeAsync((service: CountryMappingService, httpMock: HttpTestingController) => {
      let res: any
      service.getCountryMapping().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/country-mapping')
      req.flush('apiResponse')

      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')

      httpMock.verify()
    })
  ))
})
