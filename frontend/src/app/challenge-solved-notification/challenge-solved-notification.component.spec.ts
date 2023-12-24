/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ClipboardModule } from 'ngx-clipboard'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { CountryMappingService } from '../Services/country-mapping.service'
import { CookieModule, CookieService } from 'ngx-cookie'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

class MockSocket {
  on (str: string, callback: any) {
    callback()
  }

  emit (a: any, b: any) {
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
  let mockSocket: any

  beforeEach(waitForAsync(() => {
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    cookieService = jasmine.createSpyObj('CookieService', ['put'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCode'])
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        ClipboardModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ChallengeSolvedNotificationComponent],
      providers: [
        { provide: SocketIoService, useValue: socketIoService },
        { provide: TranslateService, useValue: translateService },
        { provide: CookieService, useValue: cookieService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: ConfigurationService, useValue: configurationService },
        CountryMappingService
      ]
    })
      .compileComponents()
  }))

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
      { message: 'foo', flag: '1234', copied: false },
      { message: 'bar', flag: '5678', copied: false }
    ]
    component.closeNotification(0)

    expect(component.notifications).toEqual([{ message: 'bar', flag: '5678', copied: false }])
  })

  it('should delete all notifications if the shiftKey was pressed', () => {
    component.notifications = [
      { message: 'foo', flag: '1234', copied: false },
      { message: 'bar', flag: '5678', copied: false }
    ]
    component.closeNotification(0, true)

    expect(component.notifications).toEqual([])
  })

  it('should add new notification', fakeAsync(() => {
    translateService.get.and.returnValue(of('CHALLENGE_SOLVED'))
    component.notifications = []
    component.showNotification({ challenge: 'Test', flag: '1234' })
    tick()

    expect(translateService.get).toHaveBeenCalledWith('CHALLENGE_SOLVED', { challenge: 'Test' })
    expect(component.notifications).toEqual([{ message: 'CHALLENGE_SOLVED', flag: '1234', copied: false, country: undefined }])
  }))

  it('should store retrieved continue code as cookie for 1 year', () => {
    challengeService.continueCode.and.returnValue(of('12345'))

    const expires = new Date()
    component.saveProgress()
    expires.setFullYear(expires.getFullYear() + 1)

    expect(cookieService.put).toHaveBeenCalledWith('continueCode', '12345', { expires })
  })

  it('should throw error when not supplied with a valid continue code', () => {
    challengeService.continueCode.and.returnValue(of(undefined))
    console.log = jasmine.createSpy('log')

    expect(component.saveProgress).toThrow()
  })

  it('should log error from continue code API call directly to browser console', fakeAsync(() => {
    challengeService.continueCode.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.saveProgress()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should show CTF flag codes if configured accordingly', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showFlagsInNotifications: true } }))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeTrue()
  })

  it('should hide CTF flag codes if configured accordingly', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showFlagsInNotifications: false } }))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeFalse()
  })

  it('should hide CTF flag codes by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { } }))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeFalse()
  })

  it('should hide FBCTF-specific country details by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { } }))
    component.ngOnInit()

    expect(component.showCtfCountryDetailsInNotifications).toBe('none')
  })

  it('should not load countries for FBCTF when configured to hide country details', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ ctf: { showCountryDetailsInNotifications: 'none' } }))
    component.ngOnInit()

    expect(component.showCtfCountryDetailsInNotifications).toBe('none')
    expect(component.countryMap).toBeUndefined()
  })
})
