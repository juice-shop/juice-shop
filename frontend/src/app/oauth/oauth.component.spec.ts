/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { OAuthComponent } from './oauth.component'
import { LoginComponent } from '../login/login.component'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { MatTooltipModule } from '@angular/material/tooltip'
import { of, throwError } from 'rxjs'
import { UserService } from '../Services/user.service'
import { CookieModule } from 'ngy-cookie'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('OAuthComponent', () => {
  let component: OAuthComponent
  let fixture: ComponentFixture<OAuthComponent>
  let userService: any

  beforeEach(waitForAsync(() => {
    userService = jasmine.createSpyObj('UserService', ['oauthLogin', 'login', 'save'])
    userService.oauthLogin.and.returnValue(of({ email: '' }))
    userService.login.and.returnValue(of({}))
    userService.save.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: 'login', component: LoginComponent }
      ]),
      ReactiveFormsModule,
      CookieModule.forRoot(),
      TranslateModule.forRoot(),
      MatInputModule,
      MatIconModule,
      MatCardModule,
      MatFormFieldModule,
      MatCheckboxModule,
      MatTooltipModule,
      OAuthComponent, LoginComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { params: '?alt=json&access_token=TEST' } } } },
        { provide: UserService, useValue: userService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OAuthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('removes authentication token and basket id on failed OAuth login attempt', fakeAsync(() => {
    userService.oauthLogin.and.returnValue(throwError({ error: 'Error' }))
    component.ngOnInit()
    expect(localStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('bid')).toBeNull()
  }))

  it('will create regular user account with base64 encoded reversed email as password', fakeAsync(() => {
    userService.oauthLogin.and.returnValue(of({ email: 'test@test.com' }))
    component.ngOnInit()
    expect(userService.save).toHaveBeenCalledWith({ email: 'test@test.com', password: '', passwordRepeat: '' })
  }))

  it('logs in user even after failed account creation as account might already have existed from previous OAuth login', fakeAsync(() => {
    userService.oauthLogin.and.returnValue(of({ email: 'test@test.com' }))
    userService.save.and.returnValue(throwError({ error: 'Account already exists' }))
    component.ngOnInit()
    expect(userService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '', oauth: true })
  }))

  it('removes authentication token and basket id on failed subsequent regular login attempt', fakeAsync(() => {
    userService.login.and.returnValue(throwError({ error: 'Error' }))
    component.login({ email: '' })
    expect(localStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('bid')).toBeNull()
  }))
})
