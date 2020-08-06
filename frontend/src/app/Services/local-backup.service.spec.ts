import { inject, TestBed } from '@angular/core/testing'

import { LocalBackupService } from './local-backup.service'
import { CookieService } from 'ngx-cookie-service'
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatSnackBarModule } from '@angular/material/snack-bar'

describe('LocalBackupService', () => {
  let service: LocalBackupService
  let snackBar: any

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        MatSnackBarModule
      ],
      providers: [TranslateService, CookieService]
    })
    service = TestBed.inject(LocalBackupService)
  })

  it('should be created', inject([CookieService], (service: LocalBackupService) => {
    expect(service).toBeTruthy()
  }))
})
