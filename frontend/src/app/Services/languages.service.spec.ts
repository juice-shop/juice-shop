/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { LanguagesService } from './languages.service'

describe('LanguagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [LanguagesService]
  }))

  it('should be created', () => {
    const service: LanguagesService = TestBed.inject(LanguagesService)
    expect(service).toBeTruthy()
  })

  it('should get the language list through the rest API', inject([LanguagesService, HttpTestingController],
    fakeAsync((service: LanguagesService, httpMock: HttpTestingController) => {
      let res: any
      service.getLanguages().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/languages')
      req.flush('apiResponse')

      tick()

      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')

      httpMock.verify()
    })
  ))
})
