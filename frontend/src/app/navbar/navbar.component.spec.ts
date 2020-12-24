/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { SearchResultComponent } from '../search-result/search-result.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UserService } from '../Services/user.service'
import { ConfigurationService } from '../Services/configuration.service'
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { NavbarComponent } from './navbar.component'
import { Location } from '@angular/common'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { AdministrationService } from '../Services/administration.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CookieService } from 'ngx-cookie-service'
import { SocketIoService } from '../Services/socket-io.service'
import { of, throwError } from 'rxjs'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { NgMatSearchBarModule } from 'ng-mat-search-bar'
import { LoginGuard } from '../app.guard'
import { MatRadioModule } from '@angular/material/radio'
import { MatSnackBarModule } from '@angular/material/snack-bar'

class MockSocket {
  on (str: string, callback: Function) {
    callback(str)
  }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>
  let administrationService: any
  let configurationService: any
  let userService: any
  let challengeService: any
  let translateService: any
  let cookieService: any
  let mockSocket: any
  let socketIoService: any
  let location: Location
  let loginGuard

  beforeEach(waitForAsync(() => {

    administrationService = jasmine.createSpyObj('AdministrationService',['getApplicationVersion'])
    administrationService.getApplicationVersion.and.returnValue(of(undefined))
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    userService = jasmine.createSpyObj('UserService',['whoAmI','getLoggedInState','saveLastLoginIp'])
    userService.whoAmI.and.returnValue(of({}))
    userService.getLoggedInState.and.returnValue(of(true))
    userService.saveLastLoginIp.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn',['next'])
    userService.isLoggedIn.next.and.returnValue({})
    challengeService = jasmine.createSpyObj('ChallengeService',['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    cookieService = jasmine.createSpyObj('CookieService',['delete', 'get', 'set'])
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    loginGuard = jasmine.createSpyObj('LoginGuard',['tokenDecode'])
    loginGuard.tokenDecode.and.returnValue(of(true))

    TestBed.configureTestingModule({
      declarations: [ NavbarComponent, SearchResultComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'search', component: SearchResultComponent }
        ]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatCardModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatGridListModule,
        NgMatSearchBarModule,
        MatRadioModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AdministrationService, useValue: administrationService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: UserService, useValue: userService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CookieService, useValue: cookieService },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: LoginGuard, useValue: loginGuard },
        TranslateService
      ]
    })
    .compileComponents()

    location = TestBed.inject(Location)
    translateService = TestBed.inject(TranslateService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
    localStorage.removeItem('token')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold application version', () => {
    administrationService.getApplicationVersion.and.returnValue(of('x.y.z'))
    component.ngOnInit()
    expect(component.version).toBe('vx.y.z')
  })

  it('should show nothing on missing application version', () => {
    administrationService.getApplicationVersion.and.returnValue(of(undefined))
    component.ngOnInit()
    expect(component.version).toBe('')
  })

  it('should show nothing on error retrieving application version', fakeAsync(() => {
    administrationService.getApplicationVersion.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.version).toBe('')
  }))

  it('should log errors directly to browser console', fakeAsync(() => {
    administrationService.getApplicationVersion.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should use default application name if not customized', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.applicationName).toBe('OWASP Juice Shop')
  })

  it('should use custom application name URL if configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { name: 'name' } }))
    component.ngOnInit()
    expect(component.applicationName).toBe('name')
  })

  it('should set user email on page reload if user is authenticated', () => {
    userService.whoAmI.and.returnValue(of({ email: 'dummy@dummy.com' }))
    localStorage.setItem('token','token')
    component.ngOnInit()
    expect(component.userEmail).toBe('dummy@dummy.com')
  })

  it('should set user email on getting logged in', () => {
    localStorage.removeItem('token')
    userService.getLoggedInState.and.returnValue(of(true))
    userService.whoAmI.and.returnValue(of({ email: 'dummy@dummy.com' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('dummy@dummy.com')
  })

  it('should log errors directly to browser console when getting user failed', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should show GitHub button by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.showGitHubLink).toBe(true)
  })

  it('should hide GitHub ribbon if so configured', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { showGitHubLinks: false } }))
    component.ngOnInit()
    expect(component.showGitHubLink).toBe(false)
  })

  it('should log error while getting application configuration from backend API directly to browser console', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hide Score Board menu item when corresponding challenge was not solved yet', () => {
    challengeService.find.and.returnValue(of([{ solved: false }]))
    component.ngOnInit()
    expect(component.scoreBoardVisible).toBeFalsy()
  })

  it('should show Score Board menu item if corresponding challenge has been solved', () => {
    challengeService.find.and.returnValue(of([{ solved: true }]))
    component.ngOnInit()
    expect(component.scoreBoardVisible).toBe(true)
  })

  it('forwards to search result with search query as URL parameter', fakeAsync(() => {
    component.search('lemon juice')
    tick()
    expect(location.path()).toBe(encodeURI('/search?q=lemon juice'))
  }))

  it('forwards to search result with empty search criteria if no search query is present', fakeAsync(() => {
    component.search('')
    tick()
    expect(location.path()).toBe(encodeURI('/search'))
  }))

  it('should remove authentication token from localStorage', () => {
    spyOn(localStorage,'removeItem')
    component.logout()
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('should remove authentication token from cookies', () => {
    component.logout()
    expect(cookieService.delete).toHaveBeenCalledWith('token', '/')
  })

  it('should remove basket id from session storage', () => {
    spyOn(sessionStorage,'removeItem')
    component.logout()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('bid')
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

  it('should set selected a language', () => {
    spyOn(translateService,'use').and.callFake((lang: any) => lang)
    component.changeLanguage('xx')
    expect(translateService.use).toHaveBeenCalledWith('xx')
  })
})
