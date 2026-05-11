/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { inject, TestBed } from '@angular/core/testing'
import { firstValueFrom, throwError } from 'rxjs'

import { LocalBackupService } from './local-backup.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import * as FileSaver from 'file-saver'
import { ChallengeService } from './challenge.service'

describe('LocalBackupService', () => {
  let snackBar: any
  let cookieService: any
  let challengeService: any

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    snackBar.open.and.returnValue(null)
    challengeService = jasmine.createSpyObj('ChallengeService', ['restoreProgress', 'continueCode', 'continueCodeFindIt', 'continueCodeFixIt'])

    TestBed.configureTestingModule({
      imports: [
        CookieModule.forRoot(),
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
        { provide: ChallengeService, useValue: challengeService },
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
    spyOn(FileSaver, 'saveAs').and.stub()

    cookieService.put('language', 'de')
    service.save()

    const blob = new Blob([JSON.stringify({ version: 1, language: 'de' })], { type: 'text/plain;charset=utf-8' })
    expect(FileSaver.saveAs).toHaveBeenCalledWith(blob, `owasp_juice_shop-${new Date().toISOString().split('T')[0]}.json`)
  }))

  it('should restore language from backup file', async () => {
    const service = TestBed.inject(LocalBackupService)
    cookieService.put('language', 'de')
    await firstValueFrom(service.restore(new File(['{ "version": 1, "language": "cn" }'], 'test.json')))
    expect(cookieService.get('language')).toBe('cn')
    expect(snackBar.open).toHaveBeenCalled()
  })

  it('should not restore language from an outdated backup version', async () => {
    const service = TestBed.inject(LocalBackupService)
    cookieService.put('language', 'de')
    await firstValueFrom(service.restore(new File(['{ "version": 0, "language": "cn" }'], 'test.json')))
    expect(cookieService.get('language')).toBe('de')
    expect(snackBar.open).toHaveBeenCalled()
  })

  it('should log and fallback to cookies when continue code retrieval fails during save', inject([LocalBackupService], (service: LocalBackupService) => {
    spyOn(FileSaver, 'saveAs').and.stub()
    // ensure cookie fallback values exist
    cookieService.put('continueCode', 'C1')
    cookieService.put('continueCodeFindIt', 'C2')
    cookieService.put('continueCodeFixIt', 'C3')

    // simulate server failure for continue codes
    challengeService.continueCode.and.returnValue(throwError('Error'))
    challengeService.continueCodeFindIt.and.returnValue(throwError('Error'))
    challengeService.continueCodeFixIt.and.returnValue(throwError('Error'))

    console.log = jasmine.createSpy('log')

    service.save('test-backup')

    expect(console.log).toHaveBeenCalledWith('Failed to retrieve continue code(s) for backup from server. Using cookie values as fallback.')
    expect(FileSaver.saveAs).toHaveBeenCalled()
  }))

})
