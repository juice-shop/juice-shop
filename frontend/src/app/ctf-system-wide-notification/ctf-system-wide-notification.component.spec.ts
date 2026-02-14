/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { ConfigurationService } from '../Services/configuration.service'
import { CtfSystemWideNotificationService } from '../Services/ctf-system-wide-notification.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
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

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of(BASE_CTF_CONFIG))
    notificationService = jasmine.createSpyObj('CtfSystemWideNotificationService', ['fetchNotification'])
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))

    TestBed.configureTestingModule({
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

    fixture = TestBed.createComponent(CtfSystemWideNotificationComponent)
    component = fixture.componentInstance
  }))

  afterEach(() => {
    component.ngOnDestroy()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not start polling if ctf.systemWideNotifications.url is not configured', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(of({
      ctf: { showFlagsInNotifications: false, showCountryDetailsInNotifications: 'none', countryMapping: [] }
    }))
    fixture.detectChanges()
    tick(POLL_FREQUENCY * 1000)

    expect(notificationService.fetchNotification).not.toHaveBeenCalled()
    expect(component.notification).toBeNull()
  }))

  it('should not start polling if pollFrequencySeconds is not configured', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(of({
      ctf: { systemWideNotifications: { url: 'http://example.com/notify' } }
    }))
    fixture.detectChanges()
    tick(POLL_FREQUENCY * 1000)

    expect(notificationService.fetchNotification).not.toHaveBeenCalled()
    expect(component.notification).toBeNull()
  }))

  it('should show notification when enabled is true and message is non-empty', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello world', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).toEqual({ message: 'hello world', enabled: true, updatedAt: '2026-01-01T00:00:00Z' })
  }))

  it('should not show notification when enabled is false', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello world', enabled: false, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).toBeNull()
  }))

  it('should not show notification when message is empty string', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: '', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).toBeNull()
  }))

  it('should not show notification when message is null', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: null, enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).toBeNull()
  }))

  it('should hide notification and record dismissedAt when dismiss is called', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).not.toBeNull()
    component.dismiss()

    expect(component.notification).toBeNull()
    expect((component as any).dismissedAt).toBe('2026-01-01T00:00:00Z')
  }))

  it('should not show notification again after dismiss if updatedAt is unchanged', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)
    component.dismiss()

    tick(POLL_FREQUENCY * 1000)

    expect(component.notification).toBeNull()
  }))

  it('should show notification again after dismiss if updatedAt changes', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)
    component.dismiss()

    notificationService.fetchNotification.and.returnValue(of({ message: 'new message', enabled: true, updatedAt: '2026-02-01T00:00:00Z' }))
    tick(POLL_FREQUENCY * 1000)

    expect(component.notification).toEqual({ message: 'new message', enabled: true, updatedAt: '2026-02-01T00:00:00Z' })
  }))

  it('should handle fetch errors gracefully and keep notification null', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(throwError(() => new Error('Network error')))
    fixture.detectChanges()
    tick(0)

    expect(component.notification).toBeNull()
  }))

  it('should unsubscribe from polling on destroy', fakeAsync(() => {
    notificationService.fetchNotification.and.returnValue(of({ message: 'hello', enabled: true, updatedAt: '2026-01-01T00:00:00Z' }))
    fixture.detectChanges()
    tick(0)
    component.ngOnDestroy()

    notificationService.fetchNotification.calls.reset()
    tick(POLL_FREQUENCY * 1000)

    expect(notificationService.fetchNotification).not.toHaveBeenCalled()
  }))
})
