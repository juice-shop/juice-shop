/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { PhotoWallService } from './photo-wall.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PhotoWallService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PhotoWallService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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

  it('should handle error when getting memories', inject([PhotoWallService, HttpTestingController],
    fakeAsync((service: PhotoWallService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.get().subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/memories/')
      req.flush(null, { status: 503, statusText: 'Service Unavailable' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(503)
      httpMock.verify()
    })
  ))

  it('should handle error when creating memory', inject([PhotoWallService, HttpTestingController],
    fakeAsync((service: PhotoWallService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.addMemory('str', new File([''], 'image')).subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/memories')
      req.flush(null, { status: 400, statusText: 'Bad Request' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(400)
      httpMock.verify()
    })
  ))
})
