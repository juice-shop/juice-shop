/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { CookieModule, CookieService } from 'ngy-cookie'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ServerStartedNotificationComponent } from './server-started-notification.component'
import { ChallengeService } from '../Services/challenge.service'
import { SocketIoService } from '../Services/socket-io.service'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

class MockSocket {
    on(str: string, callback: any) {
        callback()
    }
}

describe('ServerStartedNotificationComponent', () => {
    let component: ServerStartedNotificationComponent
    let fixture: ComponentFixture<ServerStartedNotificationComponent>
    let challengeService: any
    let translateService: any
    let cookieService: any
    let socketIoService: any
    let mockSocket: any

    beforeEach(async () => {
        challengeService = {
            restoreProgress: vi.fn().mockName("ChallengeService.restoreProgress"),
            restoreProgressFindIt: vi.fn().mockName("ChallengeService.restoreProgressFindIt"),
            restoreProgressFixIt: vi.fn().mockName("ChallengeService.restoreProgressFixIt")
        }
        challengeService.restoreProgress.mockReturnValue(of({}))
        challengeService.restoreProgressFindIt.mockReturnValue(of({}))
        challengeService.restoreProgressFixIt.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        mockSocket = new MockSocket()
        socketIoService = {
            socket: vi.fn().mockName("SocketIoService.socket")
        }
        socketIoService.socket.mockReturnValue(mockSocket)

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                CookieModule.forRoot(),
                MatCardModule,
                MatButtonModule,
                MatIconModule,
                ServerStartedNotificationComponent],
            providers: [
                { provide: ChallengeService, useValue: challengeService },
                { provide: TranslateService, useValue: translateService },
                { provide: SocketIoService, useValue: socketIoService },
                CookieService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()

        cookieService = TestBed.inject(CookieService)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(ServerStartedNotificationComponent)
        component = fixture.componentInstance
        cookieService.remove('continueCode')
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should keep continue code cookie after successfully restoring progress on server start', () => {
        vi.spyOn(mockSocket, 'on')
        cookieService.put('continueCode', 'CODE')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(cookieService.get('continueCode')).toBe('CODE')
    })

    it('should set auto-restore success-message when progress restore succeeds', () => {
        vi.spyOn(mockSocket, 'on')
        translateService.get.mockReturnValue(of('AUTO_RESTORED_PROGRESS'))
        cookieService.put('continueCode', 'CODE')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
    })

    it('should translate AUTO_RESTORED_PROGRESS message', () => {
        vi.spyOn(mockSocket, 'on')
        translateService.get.mockReturnValue(of('Translation of AUTO_RESTORED_PROGRESS'))
        cookieService.put('continueCode', 'CODE')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORED_PROGRESS')
    })

    it('should log errors during automatic progress restore directly to browser console', () => {
        vi.spyOn(mockSocket, 'on')
        challengeService.restoreProgress.mockReturnValue(throwError('Error'))
        cookieService.put('continueCode', 'CODE')
        console.log = vi.fn()
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should set auto-restore error-message when progress restore failed', () => {
        vi.spyOn(mockSocket, 'on')
        challengeService.restoreProgress.mockReturnValue(throwError('Error'))
        translateService.get.mockReturnValue(of('AUTO_RESTORE_PROGRESS_FAILED'))
        cookieService.put('continueCode', 'CODE')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
    })

    it('should translate AUTO_RESTORE_PROGRESS_FAILED message including the returned error', () => {
        vi.spyOn(mockSocket, 'on')
        challengeService.restoreProgress.mockReturnValue(throwError('Error'))
        translateService.get.mockReturnValue(of('Translation of AUTO_RESTORE_PROGRESS_FAILED: error'))
        cookieService.put('continueCode', 'CODE')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORE_PROGRESS_FAILED: error')
    })

    it('do nothing if continueCode cookie is not present', () => {
        vi.spyOn(mockSocket, 'on')
        component.ngOnInit()
        const callback = vi.mocked(mockSocket.on).mock.calls[0][1]
        callback()
        expect(vi.mocked(mockSocket.on).mock.calls[0][0]).toBe('server started')
        expect(component.hackingProgress.autoRestoreMessage).toBeUndefined()
    })

    it('should remove the restore message when closing the notification', () => {
        component.closeNotification()
        expect(component.hackingProgress.autoRestoreMessage).toBeNull()
    })

    it('should remove the continue code cookie when clearing the progress', () => {
        component.clearProgress()
        expect(cookieService.get('continueCode')).toBeUndefined()
        expect(component.hackingProgress.cleared).toBe(true)
    })
})
