import { inject, TestBed } from '@angular/core/testing'

import { LocalBackupService } from './local-backup.service'
import { CookieService } from 'ngx-cookie-service'

describe('LocalBackupService', () => {
  let service: LocalBackupService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CookieService]
    })
    service = TestBed.inject(LocalBackupService)
  })

  it('should be created', inject([CookieService], (service: LocalBackupService) => {
    expect(service).toBeTruthy()
  }))
})
