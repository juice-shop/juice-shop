/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter.component'
import { SearchResultComponent } from '../search-result/search-result.component'
import { UserService } from '../Services/user.service'
import { WindowRefService } from '../Services/window-ref.service'

import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TranslateModule } from '@ngx-translate/core'
import { CookieModule, CookieService } from 'ngx-cookie'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { of } from 'rxjs'
import { TwoFactorAuthService } from '../Services/two-factor-auth-service'

describe('TwoFactorAuthEnterComponent', () => {
  let component: TwoFactorAuthEnterComponent
  let fixture: ComponentFixture<TwoFactorAuthEnterComponent>
  let cookieService: any
  let userService: any
  let twoFactorAuthService: any

  beforeEach(waitForAsync(() => {
    userService = jasmine.createSpyObj('UserService', ['login'])
    userService.login.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})
    twoFactorAuthService = jasmine.createSpyObj('TwoFactorAuthService', ['verify'])
    twoFactorAuthService.verify.and.returnValue(of({ }))

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'search', component: SearchResultComponent }
        ]),
        ReactiveFormsModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatButtonModule,
        MatGridListModule,
        MatSnackBarModule,
        MatTooltipModule
      ],
      declarations: [TwoFactorAuthEnterComponent, SearchResultComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: TwoFactorAuthService, useValue: twoFactorAuthService },
        CookieService,
        WindowRefService,
        CookieService
      ]
    })
      .compileComponents()
    cookieService = TestBed.inject(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthEnterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should store authentication token in cookie', () => {
    twoFactorAuthService.verify.and.returnValue(of({ token: 'TOKEN' }))
    component.verify()

    expect(cookieService.get('token')).toBe('TOKEN')
  })

  it('should store authentication token in local storage', () => {
    twoFactorAuthService.verify.and.returnValue(of({ token: 'TOKEN' }))
    component.verify()

    expect(localStorage.getItem('token')).toBe('TOKEN')
  })

  it('should store basket ID in session storage', () => {
    twoFactorAuthService.verify.and.returnValue(of({ bid: 42 }))
    component.verify()

    expect(sessionStorage.getItem('bid')).toBe('42')
  })

  xit('should notify about user login after 2FA verification', () => { // FIXME Spy call is not registered at all
    component.verify()

    expect(userService.isLoggedIn.next).toHaveBeenCalledWith(true)
  })
})
