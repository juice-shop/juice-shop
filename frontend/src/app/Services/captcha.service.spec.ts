/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { CaptchaService } from './captcha.service'

describe('CaptchaService', () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CaptchaService]
    })
  })

  it('should be created', inject([CaptchaService], (service: CaptchaService) => {
    expect(service).toBeTruthy()
  }))

  it('should get captcha directly from the rest api', inject([CaptchaService, HttpTestingController],
    fakeAsync((service: CaptchaService, httpMock: HttpTestingController) => {
      let res: any
      service.getCaptcha().subscribe((data) => res = data)
      const req = httpMock.expectOne('http://localhost:3000/rest/captcha/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
