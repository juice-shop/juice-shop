/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { CountryMappingService } from '../Services/country-mapping.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

class MockSocket {
    on(str: string, callback: any) {
        callback(str)
    }

    emit() {
        return null
    }
}

describe('ChallengeSolvedNotificationComponent', () => {
    let component: ChallengeSolvedNotificationComponent
    let fixture: ComponentFixture<ChallengeSolvedNotificationComponent>
    let socketIoService: any
    let translateService: any
    let cookieService: any
    let challengeService: any
    let configurationService: any
    let countryMappingService: any
    let snackBarHelperService: any
    let mockSocket: any

    beforeEach(async () => {
        mockSocket = new MockSocket()
        socketIoService = {
            socket: vi.fn().mockName("SocketIoService.socket")
        }
        socketIoService.socket.mockReturnValue(mockSocket)
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        cookieService = {
            put: vi.fn().mockName("CookieService.put")
        }
        challengeService = {
            continueCode: vi.fn().mockName("ChallengeService.continueCode"),
            find: vi.fn().mockName("ChallengeService.find")
        }
        challengeService.find.mockReturnValue(of([]))
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        countryMappingService = {
            getCountryMapping: vi.fn().mockName("CountryMappingService.getCountryMapping")
        }
        countryMappingService.getCountryMapping.mockReturnValue(of({}))
        snackBarHelperService = {
            open: vi.fn().mockName("SnackBarHelperService.open")
        }

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                CookieModule.forRoot(),
                MatCardModule,
                MatButtonModule,
                MatIconModule,
                ChallengeSolvedNotificationComponent],
            providers: [
                { provide: SocketIoService, useValue: socketIoService },
                { provide: TranslateService, useValue: translateService },
                { provide: CookieService, useValue: cookieService },
                { provide: ChallengeService, useValue: challengeService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: CountryMappingService, useValue: countryMappingService },
                { provide: SnackBarHelperService, useValue: snackBarHelperService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(ChallengeSolvedNotificationComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should delete notifictions', () => {
        component.notifications = [
            { key: 'foo', message: 'foo', flag: '1234', copied: false },
            { key: 'bar', message: 'bar', flag: '5678', copied: false }
        ]
        component.closeNotification(0)

        expect(component.notifications).toEqual([{ key: 'bar', message: 'bar', flag: '5678', copied: false }])
    })

    it('should delete all notifications if the shiftKey was pressed', () => {
        component.notifications = [
            { key: 'foo', message: 'foo', flag: '1234', copied: false },
            { key: 'bar', message: 'bar', flag: '5678', copied: false }
        ]
        component.closeNotification(0, true)

        expect(component.notifications).toEqual([])
    })

    it('should add new notification', async () => {
        translateService.get.mockReturnValue(of('CHALLENGE_SOLVED'))
        component.notifications = []
        component.showNotification({ key: 'test', challenge: 'Test', flag: '1234' })

        await vi.waitFor(() => {
            expect(translateService.get).toHaveBeenCalledWith('CHALLENGE_SOLVED', { challenge: 'Test' })
            expect(component.notifications).toEqual([{ key: 'test', message: 'CHALLENGE_SOLVED', flag: '1234', copied: false, country: undefined, codingChallenge: false }])
        })
    })

    it('should store retrieved continue code as cookie for 1 year', () => {
        challengeService.continueCode.mockReturnValue(of('12345'))

        const expires = new Date()
        component.saveProgress()
        expires.setFullYear(expires.getFullYear() + 1)

        expect(cookieService.put).toHaveBeenCalledWith('continueCode', '12345', expect.objectContaining({ expires: expect.any(Date) }))
        const callArgs = vi.mocked(cookieService.put).mock.lastCall
        expect(callArgs[2].expires.getFullYear()).toBe(expires.getFullYear())
        expect(callArgs[2].expires.getMonth()).toBe(expires.getMonth())
        expect(callArgs[2].expires.getDate()).toBe(expires.getDate())
        expect(callArgs[2].expires.getHours()).toBe(expires.getHours())
        expect(callArgs[2].expires.getMinutes()).toBe(expires.getMinutes())
        expect(callArgs[2].expires.getSeconds()).toBe(expires.getSeconds())
    })

    it('should throw error when not supplied with a valid continue code', () => {
        challengeService.continueCode.mockReturnValue(of(undefined))
        console.log = vi.fn()

        expect(component.saveProgress).toThrow()
    })

    it('should log error from continue code API call directly to browser console', () => {
        challengeService.continueCode.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.saveProgress()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should show CTF flag codes if configured accordingly', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showFlagsInNotifications: true } }))
        component.ngOnInit()

        expect(component.showCtfFlagsInNotifications).toBe(true)
    })

    it('should hide CTF flag codes if configured accordingly', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showFlagsInNotifications: false } }))
        component.ngOnInit()

        expect(component.showCtfFlagsInNotifications).toBe(false)
    })

    it('should hide CTF flag codes by default', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: {} }))
        component.ngOnInit()

        expect(component.showCtfFlagsInNotifications).toBe(false)
    })

    it('should hide FBCTF-specific country details by default', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: {} }))
        component.ngOnInit()

        expect(component.showCtfCountryDetailsInNotifications).toBe('none')
    })

    it('should not load countries for FBCTF when configured to hide country details', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showCountryDetailsInNotifications: 'none' } }))
        component.ngOnInit()

        expect(component.showCtfCountryDetailsInNotifications).toBe('none')
        expect(component.countryMap).toBeUndefined()
    })

    it('should load countries for FBCTF when configured to show country details', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showCountryDetailsInNotifications: 'both' } }))
        countryMappingService.getCountryMapping.mockReturnValue(of({ scoreBoardChallenge: { name: 'Canada', code: 'CA' }, errorHandlingChallenge: { name: 'Austria', code: 'AT' } }))
        component.ngOnInit()

        expect(component.showCtfCountryDetailsInNotifications).toBe('both')
        expect(component.countryMap).toEqual({ scoreBoardChallenge: { name: 'Canada', code: 'CA' }, errorHandlingChallenge: { name: 'Austria', code: 'AT' } })
    })

    it('should show mapped country for FBCTF when configured accordingly', async () => {
        translateService.get.mockReturnValue(of('CHALLENGE_SOLVED'))
        configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showCountryDetailsInNotifications: 'both' } }))
        countryMappingService.getCountryMapping.mockReturnValue(of({ test: { name: 'Canada', code: 'CA' } }))
        component.ngOnInit()
        component.notifications = []
        component.showNotification({ key: 'test', challenge: 'Test', flag: '1234' })

        await vi.waitFor(() => {
            expect(component.notifications).toEqual([{ key: 'test', message: 'CHALLENGE_SOLVED', flag: '1234', copied: false, country: { name: 'Canada', code: 'CA' }, codingChallenge: false }])
        })
    })

    it('should copy text to clipboard when navigator.clipboard is available', async () => {
        const mockClipboard = {
            writeText: vi.fn().mockReturnValue(Promise.resolve())
        }
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            writable: true
        })
        component.copyToClipboard('test-flag-123')
        await vi.waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith('test-flag-123')
            expect(snackBarHelperService.open).toHaveBeenCalledWith('COPY_SUCCESS', 'confirmBar')
        })
    })

    it('should not attempt to copy when navigator.clipboard is unavailable', () => {
        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            writable: true
        })
        component.copyToClipboard('test-flag-123')

        expect(snackBarHelperService.open).not.toHaveBeenCalled()
    })
})
