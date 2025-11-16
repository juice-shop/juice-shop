/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { type ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { ConfigurationService } from '../Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngy-cookie'
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
import { UserService } from '../Services/user.service'
import { Location } from '@angular/common'

class MockSocket {
  on (str: string, callback: any) {
    callback(str)
  }
}

describe('SidenavComponent', () => {
  let component: SidenavComponent
  let fixture: ComponentFixture<SidenavComponent>
  let challengeService: any
  let cookieService: any
  let configurationService: any
  let userService: any
  let administractionService: any
  let mockSocket: any
  let socketIoService: any
  let loginGuard
  let location: Location

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: {} }, hackingInstructor: {} }))
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    userService = jasmine.createSpyObj('UserService', ['whoAmI', 'getLoggedInState', 'saveLastLoginIp'])
    userService.whoAmI.and.returnValue(of({}))
    userService.getLoggedInState.and.returnValue(of(true))
    userService.saveLastLoginIp.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})
    administractionService = jasmine.createSpyObj('AdministrationService', ['getApplicationVersion'])
    administractionService.getApplicationVersion.and.returnValue(of(null))
    cookieService = jasmine.createSpyObj('CookieService', ['remove', 'get', 'put'])
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    loginGuard = jasmine.createSpyObj('LoginGuard', ['tokenDecode'])
    loginGuard.tokenDecode.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatListModule,
        CookieModule.forRoot(),
        RouterTestingModule,
        SidenavComponent],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: UserService, useValue: userService },
        { provide: AdministrationService, useValue: administractionService },
        { provide: CookieService, useValue: cookieService },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: LoginGuard, useValue: loginGuard },
        TranslateService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents()
    location = TestBed.inject(Location)
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

  it('should hide Score Board link when Score Board was not discovered yet', () => {
    challengeService.find.and.returnValue(of([{ name: 'Score Board', solved: false }]))
    component.getScoreBoardStatus()

    expect(component.scoreBoardVisible).toBe(false)
  })

  it('should show Score Board link when Score Board was already discovered', () => {
    challengeService.find.and.returnValue(of([{ name: 'Score Board', solved: true }]))
    component.getScoreBoardStatus()

    expect(component.scoreBoardVisible).toBe(true)
  })

  it('should remove authentication token from localStorage', () => {
    spyOn(localStorage, 'removeItem')
    component.logout()
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('should remove authentication token from cookies', () => {
    component.logout()
    expect(cookieService.remove).toHaveBeenCalledWith('token')
  })

  it('should remove basket id from session storage', () => {
    spyOn(sessionStorage, 'removeItem')
    component.logout()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('bid')
  })

  it('should remove basket item total from session storage', () => {
    spyOn(sessionStorage, 'removeItem')
    component.logout()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('itemTotal')
  })

  it('should set the login status to be false via UserService', () => {
    component.logout()
    expect(userService.isLoggedIn.next).toHaveBeenCalledWith(false)
  })

  it('should save the last login IP address', () => {
    component.logout()
    expect(userService.saveLastLoginIp).toHaveBeenCalled()
  })

  it('should forward to main page', fakeAsync(() => {
    component.logout()
    tick()
    expect(location.path()).toBe('/')
  }))
})
