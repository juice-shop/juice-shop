/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { TwoFactorAuthService } from './two-factor-auth-service'

describe('TwoFactorAuthServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [TwoFactorAuthService]
  }))

  it('should be created', inject([TwoFactorAuthService], (service: TwoFactorAuthService) => {
    expect(service).toBeTruthy()
  }))

  it('should verify TOTP token directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
    fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
      localStorage.setItem('totp_tmp_token', '000000')
      let res: any
      service.verify('123456').subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/verify')
      req.flush({ authentication: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ tmpToken: '000000', totpToken: '123456' })
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should retrieve 2FA status directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
    fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
      let res: any
      service.status().subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/status')
      req.flush({ setup: false })
      tick()

      expect(req.request.method).toBe('GET')
      expect(req.request.params.toString()).toBeFalsy()
      expect(res).toEqual({ setup: false })
      httpMock.verify()
    })
  ))

  it('should set up 2FA directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
    fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
      let res: any
      service.setup('s3cr3t!', 'initialToken', 'setupToken').subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/setup')
      req.flush({})
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ password: 's3cr3t!', initialToken: 'initialToken', setupToken: 'setupToken' })
      expect(res).toBe(undefined)
      httpMock.verify()
    })
  ))

  it('should disable 2FA directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
    fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
      let res: any
      service.disable('s3cr3t!').subscribe((data) => (res = data))

      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/disable')
      req.flush({})
      tick()

      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ password: 's3cr3t!' })
      expect(res).toBe(undefined)
      httpMock.verify()
    })
  ))
})
