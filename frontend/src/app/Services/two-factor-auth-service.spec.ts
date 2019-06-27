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
