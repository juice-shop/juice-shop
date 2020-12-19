/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { inject, TestBed } from '@angular/core/testing'

import { TwoFactorAuthService } from './two-factor-auth-service'

describe('TwoFactorAuthServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [TwoFactorAuthService]
  }))

  it('should be created', inject([TwoFactorAuthService], (service: TwoFactorAuthService) => {
    expect(service).toBeTruthy()
  }))
})
