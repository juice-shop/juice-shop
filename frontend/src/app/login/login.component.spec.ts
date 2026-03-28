/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { SearchResultComponent } from '../search-result/search-result.component'
import { WindowRefService } from '../Services/window-ref.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { UserService } from '../Services/user.service'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { LoginComponent } from './login.component'
import { RouterTestingModule } from '@angular/router/testing'
import { ReactiveFormsModule } from '@angular/forms'

import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { CookieModule, CookieService } from 'ngy-cookie'
import { Location } from '@angular/common'
import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { TranslateModule } from '@ngx-translate/core'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('LoginComponent', () => {
    let component: LoginComponent
    let fixture: ComponentFixture<LoginComponent>
    let userService: any
    let location: Location

    beforeEach(async () => {
        userService = {
            login: vi.fn().mockName("UserService.login")
        }
        userService.login.mockReturnValue(of({}))
        userService.isLoggedIn = {
            next: vi.fn().mockName("userService.isLoggedIn.next")
        }
        userService.isLoggedIn.next.mockReturnValue({})

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'search', component: SearchResultComponent }
                ]),
                ReactiveFormsModule,
                CookieModule.forRoot(),
                TranslateModule.forRoot(),
                MatCheckboxModule,
                MatFormFieldModule,
                MatCardModule,
                MatIconModule,
                MatInputModule,
                MatTableModule,
                MatPaginatorModule,
                MatDialogModule,
                MatDividerModule,
                MatGridListModule,
                MatTooltipModule,
                LoginComponent, SearchResultComponent],
            providers: [
                { provide: UserService, useValue: userService },
                WindowRefService,
                CookieService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()

        location = TestBed.inject(Location)
    })

    beforeEach(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        sessionStorage.removeItem('bid')
        fixture = TestBed.createComponent(LoginComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should have email as compulsory', () => {
        component.emailControl.setValue('')
        expect(component.emailControl.valid).toBeFalsy()
        component.emailControl.setValue('Value')
        expect(component.emailControl.valid).toBe(true)
    })

    it('should have password as compulsory', () => {
        component.passwordControl.setValue('')
        expect(component.passwordControl.valid).toBeFalsy()
        component.passwordControl.setValue('Value')
        expect(component.passwordControl.valid).toBe(true)
    })

    it('should have remember-me checked if email token is present as in localStorage', () => {
        localStorage.setItem('email', 'a@a')
        component.ngOnInit()
        expect(component.rememberMe.value).toBe(true)
    })

    it('should have remember-me unchecked if email token is not present in localStorage', () => {
        component.ngOnInit()
        expect(component.rememberMe.value).toBeFalsy()
    })

    it('should flag OAuth as disabled if server is running on unauthorized redirect URI', () => {
        expect(component.oauthUnavailable).toBe(true)
    })

    it('forwards to main page after successful login', async () => {
        userService.login.mockReturnValue(of({}))
        component.login()
        await fixture.whenStable()
        expect(location.path()).toBe('/search')
    })

    it('stores the returned authentication token in localStorage', () => {
        userService.login.mockReturnValue(of({ token: 'token' }))
        component.login()
        expect(localStorage.getItem('token')).toBe('token')
    })

    it('puts the returned basket id into browser session storage', () => {
        userService.login.mockReturnValue(of({ bid: 4711 }))
        component.login()
        expect(sessionStorage.getItem('bid')).toBe('4711')
    })

    it('removes authentication token and basket id on failed login attempt', () => {
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.login()
        expect(localStorage.getItem('token')).toBeNull()
        expect(sessionStorage.getItem('bid')).toBeNull()
    })

    it('returns error message from server to client on failed login attempt', () => {
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.login()
        expect(component.error).toBeTruthy()
    })

    it('sets form to pristine on failed login attempt', () => {
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.login()
        expect(component.emailControl.pristine).toBe(true)
        expect(component.passwordControl.pristine).toBe(true)
    })

    it('puts current email into "email" cookie on successful login with remember-me checkbox ticked', () => {
        userService.login.mockReturnValue(of({}))
        component.emailControl.setValue('horst@juice-sh.op')
        component.rememberMe.setValue(true)
        component.login()
        expect(localStorage.getItem('email')).toBe('horst@juice-sh.op')
    })

    it('puts current email into "email" cookie on failed login with remember-me checkbox ticked', () => {
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.emailControl.setValue('horst@juice-sh.op')
        component.rememberMe.setValue(true)
        component.login()
        expect(localStorage.getItem('email')).toBe('horst@juice-sh.op')
    })
})
