import { TestBed } from '@angular/core/testing'

import { TwoFactorAuthServiceService } from './two-factor-auth-service.service'

describe('TwoFactorAuthServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TwoFactorAuthServiceService = TestBed.get(TwoFactorAuthServiceService)
    expect(service).toBeTruthy()
  })
})
