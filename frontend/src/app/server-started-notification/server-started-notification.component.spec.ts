/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { CookieModule, CookieService } from 'ngx-cookie'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'

import { ServerStartedNotificationComponent } from './server-started-notification.component'
import { ChallengeService } from '../Services/challenge.service'
import { SocketIoService } from '../Services/socket-io.service'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

class MockSocket {
  on (str: string, callback: Function) {
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

  beforeEach(waitForAsync(() => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['restoreProgress'])
    challengeService.restoreProgress.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ServerStartedNotificationComponent],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: TranslateService, useValue: translateService },
        { provide: SocketIoService, useValue: socketIoService },
        CookieService
      ]
    })
      .compileComponents()

    cookieService = TestBed.inject(CookieService)
  }))

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
    spyOn(mockSocket, 'on')
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(cookieService.get('continueCode')).toBe('CODE')
  })

  it('should set auto-restore success-message when progress restore succeeds', () => {
    spyOn(mockSocket, 'on')
    translateService.get.and.returnValue(of('AUTO_RESTORED_PROGRESS'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
  })

  it('should translate AUTO_RESTORED_PROGRESS message', () => {
    spyOn(mockSocket, 'on')
    translateService.get.and.returnValue(of('Translation of AUTO_RESTORED_PROGRESS'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORED_PROGRESS')
  })

  it('should log errors during automatic progress restore directly to browser console', fakeAsync(() => {
    spyOn(mockSocket, 'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    cookieService.put('continueCode', 'CODE')
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should set auto-restore error-message when progress restore failed', fakeAsync(() => {
    spyOn(mockSocket, 'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    translateService.get.and.returnValue(of('AUTO_RESTORE_PROGRESS_FAILED'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBeDefined()
  }))

  it('should translate AUTO_RESTORE_PROGRESS_FAILED message including the returned error', fakeAsync(() => {
    spyOn(mockSocket, 'on')
    challengeService.restoreProgress.and.returnValue(throwError('Error'))
    translateService.get.and.returnValue(of('Translation of AUTO_RESTORE_PROGRESS_FAILED: error'))
    cookieService.put('continueCode', 'CODE')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
    expect(component.hackingProgress.autoRestoreMessage).toBe('Translation of AUTO_RESTORE_PROGRESS_FAILED: error')
  }))

  it('do nothing if continueCode cookie is not present', () => {
    spyOn(mockSocket, 'on')
    component.ngOnInit()
    const callback = mockSocket.on.calls.argsFor(0)[1]
    callback()
    expect(mockSocket.on.calls.argsFor(0)[0]).toBe('server started')
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
