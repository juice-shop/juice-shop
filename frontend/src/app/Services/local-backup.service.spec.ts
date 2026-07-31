/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { firstValueFrom, of, throwError } from 'rxjs'

import { LocalBackupService } from './local-backup.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { TranslateNoOpLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ChallengeService } from './challenge.service'
import { SnackBarHelperService } from './snack-bar-helper.service'

describe('LocalBackupService', () => {
    let snackBar: any
    let cookieService: any
    let challengeService: any

    beforeEach(() => {
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }
        const snackBarRef = {
            onAction: () => of(null)
        }
        snackBar.open.mockReturnValue(snackBarRef)
        challengeService = {
            restoreProgress: vi.fn().mockName("ChallengeService.restoreProgress"),
            restoreProgressFindIt: vi.fn().mockName("ChallengeService.restoreProgressFindIt"),
            restoreProgressFixIt: vi.fn().mockName("ChallengeService.restoreProgressFixIt"),
            continueCode: vi.fn().mockName("ChallengeService.continueCode"),
            continueCodeFindIt: vi.fn().mockName("ChallengeService.continueCodeFindIt"),
            continueCodeFixIt: vi.fn().mockName("ChallengeService.continueCodeFixIt")
        }
        challengeService.continueCode.mockReturnValue(of('code'))
        challengeService.continueCodeFindIt.mockReturnValue(of('codeFindIt'))
        challengeService.continueCodeFixIt.mockReturnValue(of('codeFixIt'))
        challengeService.restoreProgress.mockReturnValue(of(true))
        challengeService.restoreProgressFindIt.mockReturnValue(of(true))
        challengeService.restoreProgressFixIt.mockReturnValue(of(true))

        TestBed.configureTestingModule({
            imports: [
                CookieModule.forRoot(),
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateNoOpLoader
                    }
                })
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

    it('should be created', () => {
        const service = TestBed.inject(LocalBackupService)

        expect(service).toBeTruthy()
    })

    it('should save language to file', async () => {
        const service = TestBed.inject(LocalBackupService)
        const saveFileSpy = vi.spyOn(service, 'saveFile').mockImplementation(() => {})

        cookieService.put('language', 'de')
        await service.save()

        const blob = new Blob([JSON.stringify({ version: 1, language: 'de' })], { type: 'text/plain;charset=utf-8' })
        expect(saveFileSpy).toHaveBeenCalledWith(blob, `owasp_juice_shop-${new Date().toISOString().split('T')[0]}.json`)
    })

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

    it('should log and fallback to cookies when continue code retrieval fails during save', async () => {
        const service = TestBed.inject(LocalBackupService)
        const saveFileSpy = vi.spyOn(service, 'saveFile').mockImplementation(() => {})

        // ensure cookie fallback values exist
        cookieService.put('continueCode', 'C1')
        cookieService.put('continueCodeFindIt', 'C2')
        cookieService.put('continueCodeFixIt', 'C3')

        // simulate server failure for continue codes
        challengeService.continueCode.mockReturnValue(throwError('Error'))
        challengeService.continueCodeFindIt.mockReturnValue(throwError('Error'))
        challengeService.continueCodeFixIt.mockReturnValue(throwError('Error'))

        console.log = vi.fn()

        await service.save('test-backup')

        expect(console.log).toHaveBeenCalledWith('Failed to retrieve continue code(s) for backup from server. Using cookie values as fallback.')
        expect(saveFileSpy).toHaveBeenCalled()
    })

    it('should restore all cookies from backup file', async () => {
        const service = TestBed.inject(LocalBackupService)
        const backupData = {
            version: 1,
            banners: { welcomeBannerStatus: 'dismiss', cookieConsentStatus: 'accept' },
            language: 'en',
            continueCode: 'C1',
            continueCodeFindIt: 'C2',
            continueCodeFixIt: 'C3'
        }
        await firstValueFrom(service.restore(new File([JSON.stringify(backupData)], 'test.json')))
        expect(cookieService.get('welcomebanner_status')).toBe('dismiss')
        expect(cookieService.get('cookieconsent_status')).toBe('accept')
        expect(cookieService.get('language')).toBe('en')
        expect(cookieService.get('continueCode')).toBe('C1')
        expect(cookieService.get('continueCodeFindIt')).toBe('C2')
        expect(cookieService.get('continueCodeFixIt')).toBe('C3')
    })

    it('should handle restore error and show snackbar', async () => {
        const service = TestBed.inject(LocalBackupService)
        const snackBarHelperService = TestBed.inject(SnackBarHelperService)
        const spy = vi.spyOn(snackBarHelperService, 'open')

        await firstValueFrom(service.restore(new File(['invalid JSON'], 'test.json')))
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Backup restore operation failed'), 'errorBar')
    })

    it('should restore progress when snackbar action is clicked', async () => {
        const service = TestBed.inject(LocalBackupService)
        const reloadFn = vi.fn()
        vi.stubGlobal('location', { reload: reloadFn })

        const backupData = {
            version: 1,
            continueCode: 'C1',
            continueCodeFindIt: 'C2',
            continueCodeFixIt: 'C3'
        }
        await firstValueFrom(service.restore(new File([JSON.stringify(backupData)], 'test.json')))

        expect(challengeService.restoreProgress).toHaveBeenCalledWith(encodeURIComponent('C1'))
        expect(challengeService.restoreProgressFindIt).toHaveBeenCalledWith(encodeURIComponent('C2'))
        expect(challengeService.restoreProgressFixIt).toHaveBeenCalledWith(encodeURIComponent('C3'))
        expect(reloadFn).toHaveBeenCalled()
        vi.unstubAllGlobals()
    })

    it('should log error if progress restoration fails', async () => {
        const service = TestBed.inject(LocalBackupService)
        vi.stubGlobal('location', { reload: vi.fn() })
        challengeService.restoreProgress.mockReturnValue(throwError(() => new Error('Restore failed')))
        console.log = vi.fn()

        const backupData = { version: 1, continueCode: 'C1' }
        await firstValueFrom(service.restore(new File([JSON.stringify(backupData)], 'test.json')))

        expect(console.log).toHaveBeenCalledWith(new Error('Restore failed'))
        vi.unstubAllGlobals()
    })
})
