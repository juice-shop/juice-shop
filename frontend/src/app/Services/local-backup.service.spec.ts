import { fakeAsync, inject, TestBed } from '@angular/core/testing'

import { LocalBackupService } from './local-backup.service'
import { CookieService } from 'ngx-cookie-service'
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

describe('LocalBackupService', () => {
  let snackBar: any
  let cookieService: any

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar',['open'])
    snackBar.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatSnackBar, useValue: snackBar },
        CookieService,
        LocalBackupService
      ]
    })
    cookieService = TestBed.inject(CookieService)
  })

  it('should be created', inject([LocalBackupService], (service: LocalBackupService) => {
    expect(service).toBeTruthy()
  }))

  it('should save language to file', inject([LocalBackupService], (service: LocalBackupService) => {
    cookieService.set('language', 'de')
    service.save()
    // TODO Spy into "saveAs" and check if created file contains expected language
  }))

  it('should restore language from backup file', inject([LocalBackupService], fakeAsync((service: LocalBackupService) => {
    cookieService.set('language', 'de')
    service.restore(new File(['{ "version": 1, "language": "cn" }'], 'test.json', { type: 'application/json' })).subscribe(() => {
      expect(cookieService.get('language')).toBe('cn')
      expect(snackBar.open).toHaveBeenCalled()
    }) // FIXME Address 'Spec 'LocalBackupService should ...' has no expectations.'
  })))

  it('should not restore language from an outdated backup version', inject([LocalBackupService], fakeAsync((service: LocalBackupService) => {
    cookieService.set('language', 'de')
    service.restore(new File(['{ "version": 0, "language": "cn" }'], 'test.json', { type: 'application/json' })).subscribe(() => {
      expect(cookieService.get('language')).toBe('de')
      expect(snackBar.open).toHaveBeenCalled() // FIXME Address 'Spec 'LocalBackupService should ...' has no expectations.'
    })
  })))
})
