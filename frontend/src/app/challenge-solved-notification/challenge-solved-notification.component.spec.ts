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
import { Router } from '@angular/router'

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
                { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
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

    describe('template rendering', () => {
        it('should not render the toast container when there are no notifications', () => {
            component.notifications = []
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('.challenge-solved-toast')).toBeNull()
        })

        it('should render one notification card per entry with its message and a close button', () => {
            component.notifications = [
                { key: 'a', message: 'First', flag: 'F1', copied: false },
                { key: 'b', message: 'Second', flag: 'F2', copied: false }
            ]
            fixture.detectChanges()

            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.challenge-solved-toast')).toBeTruthy()
            expect(compiled.querySelectorAll('mat-card.accent-notification').length).toBe(2)
            expect(compiled.querySelectorAll('#closeButton').length).toBe(2)
            expect(compiled.textContent).toContain('First')
            expect(compiled.textContent).toContain('Second')
        })

        it('should invoke closeNotification with the entry index when the close button is clicked', () => {
            component.notifications = [{ key: 'a', message: 'X', flag: 'F', copied: false }]
            fixture.detectChanges()
            const spy = vi.spyOn(component, 'closeNotification').mockImplementation(() => { })
            const btn = fixture.nativeElement.querySelector('#closeButton') as HTMLButtonElement
            btn.click()
            expect(spy).toHaveBeenCalledWith(0, false)
        })

        it('should not render the view-challenge button when the notification is not a coding challenge', () => {
            component.notifications = [{ key: 'a', message: 'X', flag: 'F', copied: false, codingChallenge: false }]
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('button.view-challenge-button')).toBeNull()
        })

        it('should render the view-challenge button and wire navigateToChallenge when codingChallenge is true', () => {
            component.notifications = [{ key: 'key42', message: 'X', flag: 'F', copied: false, codingChallenge: true }]
            fixture.detectChanges()
            const spy = vi.spyOn(component, 'navigateToChallenge').mockImplementation(() => { })
            const btn = fixture.nativeElement.querySelector('button.view-challenge-button') as HTMLButtonElement
            expect(btn).toBeTruthy()
            btn.click()
            expect(spy).toHaveBeenCalledWith('key42')
        })

        it('should hide the CTF flag section by default and show it when showCtfFlagsInNotifications is true', () => {
            component.notifications = [{ key: 'a', message: 'X', flag: 'FLAG-42', copied: false, country: { code: 'CA', name: 'Canada' } }]
            component.showCtfFlagsInNotifications = false
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('.flag-box')).toBeNull()

            component.showCtfFlagsInNotifications = true
            fixture.detectChanges()
            const flagBox = fixture.nativeElement.querySelector('.flag-box') as HTMLElement
            expect(flagBox).toBeTruthy()
            expect(flagBox.textContent).toContain('FLAG-42')
        })

        it('should render the country flag icon when showCtfCountryDetailsInNotifications is "flag"', () => {
            component.notifications = [{ key: 'a', message: 'X', flag: 'F', copied: false, country: { code: 'CA', name: 'Canada' } }]
            component.showCtfFlagsInNotifications = true
            component.showCtfCountryDetailsInNotifications = 'flag'
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('.fi-ca')).toBeTruthy()
            expect(fixture.nativeElement.textContent).not.toContain('Canada')
        })

        it('should render the country name when showCtfCountryDetailsInNotifications is "name"', () => {
            component.notifications = [{ key: 'a', message: 'X', flag: 'F', copied: false, country: { code: 'CA', name: 'Canada' } }]
            component.showCtfFlagsInNotifications = true
            component.showCtfCountryDetailsInNotifications = 'name'
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('.fi-ca')).toBeNull()
            expect(fixture.nativeElement.textContent).toContain('Canada')
        })
    })

    describe('socket "challenge solved" handler', () => {
        let socket: any
        let onCallback: any

        beforeEach(() => {
            onCallback = null
            socket = {
                on: vi.fn((_: string, cb: any) => { onCallback = cb }),
                emit: vi.fn()
            }
            socketIoService.socket.mockReturnValue(socket)
            challengeService.continueCode.mockReturnValue(of('CODE'))
        })

        it('should ignore socket messages without a challenge field', () => {
            component.ngOnInit()
            const showSpy = vi.spyOn(component, 'showNotification')
            const saveSpy = vi.spyOn(component, 'saveProgress')
            onCallback({})
            expect(showSpy).not.toHaveBeenCalled()
            expect(saveSpy).not.toHaveBeenCalled()
            expect(socket.emit).not.toHaveBeenCalled()
        })

        it('should not show a notification for hidden challenges but still emit and save progress', () => {
            component.ngOnInit()
            const showSpy = vi.spyOn(component, 'showNotification')
            const saveSpy = vi.spyOn(component, 'saveProgress').mockImplementation(() => { })
            onCallback({ challenge: 'X', hidden: true, isRestore: false, flag: 'F', key: 'k' })
            expect(showSpy).not.toHaveBeenCalled()
            expect(saveSpy).toHaveBeenCalled()
            expect(socket.emit).toHaveBeenCalledWith('notification received', 'F')
        })

        it('should not save progress when the challenge is being restored', () => {
            component.ngOnInit()
            const saveSpy = vi.spyOn(component, 'saveProgress').mockImplementation(() => { })
            onCallback({ challenge: 'X', hidden: true, isRestore: true, flag: 'F', key: 'k' })
            expect(saveSpy).not.toHaveBeenCalled()
            expect(socket.emit).toHaveBeenCalledWith('notification received', 'F')
        })

        it('should show notification and save progress for a visible, non-restored challenge', () => {
            component.ngOnInit()
            const showSpy = vi.spyOn(component, 'showNotification').mockImplementation(() => { })
            const saveSpy = vi.spyOn(component, 'saveProgress').mockImplementation(() => { })
            onCallback({ challenge: 'Some Challenge', hidden: false, isRestore: false, flag: 'F', key: 'k' })
            expect(showSpy).toHaveBeenCalled()
            expect(saveSpy).toHaveBeenCalled()
        })
    })

    describe('configuration error paths', () => {
        it('should log when country mapping service fails', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ ctf: { showCountryDetailsInNotifications: 'both' } }))
            countryMappingService.getCountryMapping.mockReturnValue(throwError(() => 'CountryError'))
            console.log = vi.fn()
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith('CountryError')
            expect(component.countryMap).toBeUndefined()
        })
    })

    describe('navigateToChallenge', () => {
        it('should do nothing when called with a falsy key', () => {
            const router = TestBed.inject(Router) as any
            component.navigateToChallenge('')
            expect(router.navigate).not.toHaveBeenCalled()
        })

        it('should route to the coding-challenge page when given a key', () => {
            const router = TestBed.inject(Router) as any
            component.navigateToChallenge('key1')
            expect(router.navigate).toHaveBeenCalledWith(['/coding-challenge', 'key1'])
        })
    })
})
