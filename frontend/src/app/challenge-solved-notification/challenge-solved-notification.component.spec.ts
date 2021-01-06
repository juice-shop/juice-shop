/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ClipboardModule } from 'ngx-clipboard'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { CountryMappingService } from '../Services/country-mapping.service'
import { CookieService } from 'ngx-cookie-service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'
import { of } from 'rxjs'
import { EventEmitter } from '@angular/core'

class MockSocket {
  on (str: string, callback: Function) {
    callback()
  }
}

describe('ChallengeSolvedNotificationComponent', () => {
  let component: ChallengeSolvedNotificationComponent
  let fixture: ComponentFixture<ChallengeSolvedNotificationComponent>
  let socketIoService: any
  let translateService: any
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

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        ClipboardModule,
        MatCardModule,
        MatButtonModule
      ],
      declarations: [ChallengeSolvedNotificationComponent],
      providers: [
        { provide: SocketIoService, useValue: socketIoService },
        { provide: TranslateService, useValue: translateService },
        ConfigurationService,
        ChallengeService,
        CountryMappingService,
        CookieService
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
})
