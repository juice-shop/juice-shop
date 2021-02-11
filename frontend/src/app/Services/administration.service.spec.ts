/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { AdministrationService } from './administration.service'

describe('AdministrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdministrationService]
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
