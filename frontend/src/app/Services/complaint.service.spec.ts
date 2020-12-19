/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ComplaintService } from './complaint.service'

describe('ComplaintService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ComplaintService]
    })
  })

  it('should be created', inject([ComplaintService], (service: ComplaintService) => {
    expect(service).toBeTruthy()
  }))

  it('should create complaint directly via the rest api', inject([ComplaintService, HttpTestingController],
    fakeAsync((service: ComplaintService, httpMock: HttpTestingController) => {
      let res: any
      service.save(null).subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/api/Complaints/')
      req.flush({ data: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toBeNull()
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
