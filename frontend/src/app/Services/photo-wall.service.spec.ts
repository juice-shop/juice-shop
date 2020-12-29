/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { PhotoWallService } from './photo-wall.service'

describe('PhotoWallService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PhotoWallService]
    })
  })

  it('should be created', inject([PhotoWallService], (service: PhotoWallService) => {
    expect(service).toBeTruthy()
  }))

  it('should get memories directly from the api', inject([PhotoWallService, HttpTestingController],
    fakeAsync((service: PhotoWallService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/memories/')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should create memories directly from the api', inject([PhotoWallService, HttpTestingController],
    fakeAsync((service: PhotoWallService, httpMock: HttpTestingController) => {
      let res
      service.addMemory('str', new File([''], 'image')).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/memories')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('POST')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
