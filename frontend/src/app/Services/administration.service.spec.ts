/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { TwoFactorAuthService } from './two-factor-auth-service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('TwoFactorAuthServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
      TwoFactorAuthService,
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting()
    ]
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
      const TEST_PASSWORD = 'test-password'   // ← ★ FIXED LINE 65
      let res: any
      service.setup(TEST_PASSWORD, 'initialToken', 'setupToken').subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/setup')
      req.flush({})
      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ password: TEST_PASSWORD, initialToken: 'initialToken', setupToken: 'setupToken' })
      expect(res).toBe(undefined)
      httpMock.verify()
    })
  ))

  it('should disable 2FA directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
    fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
      const TEST_PASSWORD = 'test-password'
      let res: any
      service.disable(TEST_PASSWORD).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/2fa/disable')
      req.flush({})
      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ password: TEST_PASSWORD })
      expect(res).toBe(undefined)
      httpMock.verify()
    })
  ))
})
