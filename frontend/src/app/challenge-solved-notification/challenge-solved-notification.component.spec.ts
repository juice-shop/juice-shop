/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'

class MockSocket {
  on (str: string, callback: Function) {
    callback()
  }
}

describe('ChallengeSolvedNotificationComponent', () => {
  let component: ChallengeSolvedNotificationComponent
  let fixture: ComponentFixture<ChallengeSolvedNotificationComponent>
  let socketIoService: any
  let mockSocket: any

  beforeEach(async(() => {

    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        ClipboardModule,
        MatCardModule,
        MatButtonModule
      ],
      declarations: [ ChallengeSolvedNotificationComponent ],
      providers: [
        { provide: SocketIoService, useValue: socketIoService },
        ConfigurationService,
        ChallengeService,
        CountryMappingService,
        TranslateService,
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

  it('should delte all notifications if the shiftKey was pressed', () => {
    component.notifications = [
      { message: 'foo', flag: '1234', copied: false },
      { message: 'bar', flag: '5678', copied: false }
    ]
    component.closeNotification(0, true)

    expect(component.notifications).toEqual([])
  })
})
