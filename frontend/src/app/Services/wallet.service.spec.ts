/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { WalletService } from './wallet.service'

describe('WalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WalletService]
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
