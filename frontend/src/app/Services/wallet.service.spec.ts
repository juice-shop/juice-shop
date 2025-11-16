/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { WalletService } from './wallet.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('WalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [WalletService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
  })

  it('should be created', inject([WalletService], (service: WalletService) => {
    expect(service).toBeTruthy()
  }))

  it('should get wallet balance directly from the api', inject([WalletService, HttpTestingController],
    fakeAsync((service: WalletService, httpMock: HttpTestingController) => {
      let res
      service.get().subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('GET')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should update wallet balance directly from the api', inject([WalletService, HttpTestingController],
    fakeAsync((service: WalletService, httpMock: HttpTestingController) => {
      let res
      service.put(1).subscribe((data) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/wallet/balance')
      req.flush({ data: 'apiResponse' })
      tick()
      expect(req.request.method).toBe('PUT')
      expect(res).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
