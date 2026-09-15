/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { ConfigurationService } from '../Services/configuration.service'
import { CtfSystemWideNotificationService } from '../Services/ctf-system-wide-notification.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

import { CtfSystemWideNotificationComponent } from './ctf-system-wide-notification.component'

const POLL_FREQUENCY = 30
const BASE_CTF_CONFIG = {
    ctf: {
        showFlagsInNotifications: false,
        showCountryDetailsInNotifications: 'none',
        countryMapping: [],
        systemWideNotifications: {
            url: 'http://example.com/notify',
            pollFrequencySeconds: POLL_FREQUENCY
        }
    }
}

describe('CtfSystemWideNotificationComponent', () => {
    let component: CtfSystemWideNotificationComponent
    let fixture: ComponentFixture<CtfSystemWideNotificationComponent>
    let configurationService: any
    let notificationService: any

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of(BASE_CTF_CONFIG))
        notificationService = {
            fetchNotification: vi.fn().mockName("CtfSystemWideNotificationService.fetchNotification")
        }
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))

        await TestBed.configureTestingModule({
            imports: [
                MatCardModule,
                MatButtonModule,
                CtfSystemWideNotificationComponent
            ],
            providers: [
                { provide: ConfigurationService, useValue: configurationService },
                { provide: CtfSystemWideNotificationService, useValue: notificationService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(CtfSystemWideNotificationComponent)
        component = fixture.componentInstance
    })

    afterEach(() => {
        component.ngOnDestroy()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not start polling if ctf.systemWideNotifications.url is not configured', () => {
        vi.useFakeTimers()
        configurationService.getApplicationConfiguration.mockReturnValue(of({
            ctf: { showFlagsInNotifications: false, showCountryDetailsInNotifications: 'none', countryMapping: [] }
        }))
        fixture.detectChanges()
        vi.advanceTimersByTime(POLL_FREQUENCY * 1000)

        expect(notificationService.fetchNotification).not.toHaveBeenCalled()
        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should not start polling if pollFrequencySeconds is not configured', () => {
        vi.useFakeTimers()
        configurationService.getApplicationConfiguration.mockReturnValue(of({
            ctf: { systemWideNotifications: { url: 'http://example.com/notify' } }
        }))
        fixture.detectChanges()
        vi.advanceTimersByTime(POLL_FREQUENCY * 1000)

        expect(notificationService.fetchNotification).not.toHaveBeenCalled()
        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should show notification when enabled is true and message is non-empty', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello world', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).toEqual({ message: 'hello world', enabled: true, updatedAt: '2026-01-01T00:00:00Z' })
        vi.useRealTimers()
    })

    it('should not show notification when enabled is false', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello world', enabled: false, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should not show notification when message is empty string', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: '', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should not show notification when message is null', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: null, enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should hide notification and record dismissedAt when dismiss is called', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).not.toBeNull()
        component.dismiss()

        expect(component.notification).toBeNull()
        expect((component as any).dismissedAt).toBe('2026-01-01T00:00:00Z')
        vi.useRealTimers()
    })

    it('should not show notification again after dismiss if updatedAt is unchanged', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)
        component.dismiss()

        vi.advanceTimersByTime(POLL_FREQUENCY * 1000)

        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should show notification again after dismiss if updatedAt changes', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)
        component.dismiss()

        notificationService.fetchNotification.mockReturnValue(of({ message: 'new message', enabled: true, updatedAt: '2026-02-01T00:00:00Z' }))
        vi.advanceTimersByTime(POLL_FREQUENCY * 1000)

        expect(component.notification).toEqual({ message: 'new message', enabled: true, updatedAt: '2026-02-01T00:00:00Z' })
        vi.useRealTimers()
    })

    it('should handle fetch errors gracefully and keep notification null', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(throwError(() => new Error('Network error')))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)

        expect(component.notification).toBeNull()
        vi.useRealTimers()
    })

    it('should unsubscribe from polling on destroy', () => {
        vi.useFakeTimers()
        notificationService.fetchNotification.mockReturnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
        fixture.detectChanges()
        vi.advanceTimersByTime(0)
        component.ngOnDestroy()

        notificationService.fetchNotification.mockClear()
        vi.advanceTimersByTime(POLL_FREQUENCY * 1000)

        expect(notificationService.fetchNotification).not.toHaveBeenCalled()
        vi.useRealTimers()
    })
})
