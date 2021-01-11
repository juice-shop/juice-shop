/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { ConfigurationService } from '../Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { HttpClientModule } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { LoginGuard } from '../app.guard'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SidenavComponent } from './sidenav.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list'
import { roles } from '../roles'
import { AdministrationService } from '../Services/administration.service'

class MockSocket {
  on (str: string, callback: Function) {
    callback(str)
  }
}

describe('SidenavComponent', () => {
  let component: SidenavComponent
  let fixture: ComponentFixture<SidenavComponent>
  let challengeService: any
  let cookieService: any
  let configurationService: any
  let administractionService: any
  let mockSocket: any
  let socketIoService: any
  let loginGuard

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: {} }, hackingInstructor: {} }))
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    administractionService = jasmine.createSpyObj('AdministrationService', ['getApplicationVersion'])
    administractionService.getApplicationVersion.and.returnValue(of(null))
    cookieService = jasmine.createSpyObj('CookieService', ['delete', 'get', 'set'])
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    loginGuard = jasmine.createSpyObj('LoginGuard', ['tokenDecode'])
    loginGuard.tokenDecode.and.returnValue({})

    TestBed.configureTestingModule({
      declarations: [SidenavComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatListModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: AdministrationService, useValue: administractionService },
        { provide: CookieService, useValue: cookieService },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: LoginGuard, useValue: loginGuard },
        TranslateService
      ]
    })
      .compileComponents()
    TestBed.inject(TranslateService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should show accounting functionality when user has according role', () => {
    loginGuard.tokenDecode.and.returnValue({ data: { role: roles.accounting } })

    expect(component.isAccounting()).toBe(true)
  })

  it('should set version number as retrieved with "v" prefix', () => {
    loginGuard.tokenDecode.and.returnValue({ data: { role: roles.accounting } })

    expect(component.isAccounting()).toBe(true)
  })

  it('should not show accounting functionality when user lacks according role', () => {
    administractionService.getApplicationVersion.and.returnValue(of('1.2.3'))
    component.ngOnInit()

    expect(component.version).toBe('v1.2.3')
  })
})
