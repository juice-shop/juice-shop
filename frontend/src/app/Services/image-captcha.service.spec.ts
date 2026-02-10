/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { ImageCaptchaService } from './image-captcha.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ImageCaptchaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ImageCaptchaService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([ImageCaptchaService], (service: ImageCaptchaService) => {
    expect(service).toBeTruthy()
  }))

  it('should get captcha directly from the rest api', inject([ImageCaptchaService, HttpTestingController],
    fakeAsync((service: ImageCaptchaService, httpMock: HttpTestingController) => {
      let res: any
      service.getCaptcha().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/image-captcha/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should handle error when getting captcha', inject([ImageCaptchaService, HttpTestingController],
    fakeAsync((service: ImageCaptchaService, httpMock: HttpTestingController) => {
      let capturedError: any
      service.getCaptcha().subscribe({ next: () => {}, error: (e) => { capturedError = e } })
      const req = httpMock.expectOne('http://localhost:3000/rest/image-captcha/')
      req.flush(null, { status: 503, statusText: 'Service Unavailable' })

      tick()
      expect(capturedError).toBeTruthy()
      expect(capturedError.status).toBe(503)
      httpMock.verify()
    })
  ))
})
