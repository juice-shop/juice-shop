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
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

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
import { ConfigurationService } from '../Services/configuration.service'
import { BasketService } from '../Services/basket.service'

describe('LoginComponent', () => {
    let component: LoginComponent
    let fixture: ComponentFixture<LoginComponent>
    let userService: any
    let configurationService: any
    let basketService: any
    let windowRefService: any
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
        configurationService = {
            getApplicationConfiguration: vi.fn().mockReturnValue(of({}))
        }
        basketService = {
            mergeGuestBasketIntoUserBasket: vi.fn().mockReturnValue(of(undefined)),
            updateNumberOfCartItems: vi.fn()
        }
        windowRefService = {
            nativeWindow: {
                location: {
                    protocol: 'http:',
                    host: 'localhost:4200',
                    replace: vi.fn()
                }
            }
        }

        TestBed.configureTestingModule({
            imports: [
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
                provideRouter([{ path: 'search', component: SearchResultComponent }]),
                provideLocationMocks(),
                { provide: UserService, useValue: userService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: BasketService, useValue: basketService },
                { provide: WindowRefService, useValue: windowRefService },
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
        component.loginModel.update((model) => ({ ...model, email: '' }))
        expect(component.loginForm.email().valid()).toBeFalsy()
        component.loginModel.update((model) => ({ ...model, email: 'Value' }))
        expect(component.loginForm.email().valid()).toBe(true)
    })

    it('should have password as compulsory', () => {
        component.loginModel.update((model) => ({ ...model, password: '' }))
        expect(component.loginForm.password().valid()).toBeFalsy()
        component.loginModel.update((model) => ({ ...model, password: 'Value' }))
        expect(component.loginForm.password().valid()).toBe(true)
    })

    it('should have remember-me checked if email token is present as in localStorage', () => {
        localStorage.setItem('email', 'a@a')
        component.ngOnInit()
        expect(component.loginModel().rememberMe).toBe(true)
    })

    it('should have remember-me unchecked if email token is not present in localStorage', () => {
        component.ngOnInit()
        expect(component.loginModel().rememberMe).toBeFalsy()
    })

    it('should flag OAuth as disabled if server is running on unauthorized redirect URI', () => {
        expect(component.oauthUnavailable).toBe(true)
    })

    it('should not attempt login while the form is invalid', async () => {
        userService.login.mockReturnValue(of({}))
        await component.login()
        expect(userService.login).not.toHaveBeenCalled()
    })

    it('forwards to main page after successful login', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        userService.login.mockReturnValue(of({}))
        await component.login()
        expect(location.path()).toBe('/search')
    })

    it('stores the returned authentication token in localStorage', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        userService.login.mockReturnValue(of({ token: 'token' }))
        await component.login()
        expect(localStorage.getItem('token')).toBe('token')
    })

    it('puts the returned basket id into browser session storage', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        userService.login.mockReturnValue(of({ bid: 4711 }))
        await component.login()
        expect(sessionStorage.getItem('bid')).toBe('4711')
    })

    it('removes authentication token and basket id on failed login attempt', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        await component.login()
        expect(localStorage.getItem('token')).toBeNull()
        expect(sessionStorage.getItem('bid')).toBeNull()
    })

    it('returns error message from server to client on failed login attempt', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        await component.login()
        expect(component.error()).toBeTruthy()
    })

    it('resets touched state on failed login attempt', async () => {
        component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
        component.loginForm.email().markAsTouched()
        component.loginForm.password().markAsTouched()
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        await component.login()
        expect(component.loginForm.email().touched()).toBe(false)
        expect(component.loginForm.password().touched()).toBe(false)
    })

    it('puts current email into "email" cookie on successful login with remember-me checkbox ticked', async () => {
        userService.login.mockReturnValue(of({}))
        component.loginModel.update((model) => ({ ...model, email: 'horst@juice-sh.op', password: 'p', rememberMe: true }))
        await component.login()
        expect(localStorage.getItem('email')).toBe('horst@juice-sh.op')
    })

    it('puts current email into "email" cookie on failed login with remember-me checkbox ticked', async () => {
        userService.login.mockReturnValue(throwError({ error: 'Error' }))
        component.loginModel.update((model) => ({ ...model, email: 'horst@juice-sh.op', password: 'p', rememberMe: true }))
        await component.login()
        expect(localStorage.getItem('email')).toBe('horst@juice-sh.op')
    })

    describe('template rendering', () => {
        it('should render the login heading, email and password inputs and the login button', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')).toBeTruthy()
            expect(compiled.querySelector('input#email')).toBeTruthy()
            expect(compiled.querySelector('input#password')).toBeTruthy()
            expect(compiled.querySelector('button#loginButton')).toBeTruthy()
        })

        it('should keep the login button disabled while email and password are empty', () => {
            const compiled: HTMLElement = fixture.nativeElement
            const loginButton = compiled.querySelector('button#loginButton') as HTMLButtonElement
            expect(loginButton.disabled).toBe(true)
        })

        it('should render the remember-me checkbox, forgot-password and register links', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('#rememberMe')).toBeTruthy()
            expect(compiled.querySelector('a.forgot-pw')).toBeTruthy()
            expect(compiled.querySelector('#newCustomerLink a')).toBeTruthy()
        })

        it('should enable the login button once email and password are provided', () => {
            component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
            fixture.detectChanges()
            const loginButton = (fixture.nativeElement as HTMLElement).querySelector('#loginButton') as HTMLButtonElement
            expect(loginButton.disabled).toBe(false)
        })

        it('should check the remember-me checkbox when a remembered email exists', () => {
            localStorage.setItem('email', 'a@a')
            component.ngOnInit()
            fixture.detectChanges()
            const checkbox = (fixture.nativeElement as HTMLElement).querySelector('#rememberMe input') as HTMLInputElement
            expect(checkbox.checked).toBe(true)
        })

        it('should update the login model when the remember-me checkbox is toggled', () => {
            const checkboxInput = (fixture.nativeElement as HTMLElement).querySelector('#rememberMe input') as HTMLInputElement
            checkboxInput.click()
            fixture.detectChanges()
            expect(component.loginModel().rememberMe).toBe(true)
        })

        it('should show the error message banner when an error is set', () => {
            component.error.set('Invalid credentials')
            fixture.detectChanges()
            const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.error')
            expect(errorEl?.textContent).toContain('Invalid credentials')
        })

        it('should clear the error when the email input receives focus', () => {
            component.error.set('Invalid credentials')
            fixture.detectChanges()
            const emailInput = (fixture.nativeElement as HTMLElement).querySelector('#email') as HTMLInputElement
            emailInput.dispatchEvent(new Event('focus'))
            expect(component.error()).toBeNull()
        })

        it('should hide the OAuth login section when oauthUnavailable is true', () => {
            component.oauthUnavailable = true
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('#loginButtonGoogle')).toBeNull()
            expect(compiled.querySelector('.breakLine')).toBeNull()
        })

        it('should invoke googleLogin when the Google button is clicked', () => {
            component.oauthUnavailable = false
            fixture.detectChanges()
            const googleSpy = vi.spyOn(component, 'googleLogin')
            const googleButton = (fixture.nativeElement as HTMLElement).querySelector('#loginButtonGoogle') as HTMLButtonElement
            googleButton.click()
            expect(googleSpy).toHaveBeenCalled()
        })

        it('should show the OAuth login section and toggle password visibility', () => {
            component.oauthUnavailable = false
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement

            expect(compiled.querySelector('#loginButtonGoogle')).toBeTruthy()
            expect(compiled.querySelector('.breakLine')).toBeTruthy()

            const password = compiled.querySelector('#password') as HTMLInputElement
            const toggle = compiled.querySelector('[aria-label="Button to display the password"]') as HTMLButtonElement
            expect(password.type).toBe('password')
            toggle.click()
            fixture.detectChanges()

            expect(component.hide).toBe(false)
            expect(password.type).toBe('text')
            const hideToggle = compiled.querySelector('[aria-label="Button to hide the password"]') as HTMLButtonElement
            expect(hideToggle).toBeTruthy()
            hideToggle.click()
            fixture.detectChanges()

            expect(component.hide).toBe(true)
            expect(password.type).toBe('password')
        })

        it('should submit the form when email and password are provided', () => {
            const loginSpy = vi.spyOn(component, 'login')
            component.loginModel.update((model) => ({ ...model, email: 'user@example.com', password: 'password' }))
            fixture.detectChanges()

            const form = (fixture.nativeElement as HTMLElement).querySelector('#login-form') as HTMLFormElement
            form.dispatchEvent(new Event('submit'))

            expect(loginSpy).toHaveBeenCalled()
        })
    })

    describe('google OAuth configuration', () => {
        it('should enable OAuth when the current redirect URI is authorized', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: {
                    googleOauth: {
                        clientId: 'custom-client-id',
                        authorizedRedirects: [
                            { uri: 'http://localhost:4200' }
                        ]
                    }
                }
            }))
            component.ngOnInit()
            expect(component.oauthUnavailable).toBe(false)
            expect(component.clientId).toBe('custom-client-id')
            expect(component.redirectUri).toBe('http://localhost:4200')
        })

        it('should use the proxy URI when an authorized redirect defines one', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: {
                    googleOauth: {
                        clientId: 'custom-client-id',
                        authorizedRedirects: [
                            { uri: 'http://localhost:4200', proxy: 'http://proxy.local' }
                        ]
                    }
                }
            }))
            component.ngOnInit()
            expect(component.redirectUri).toBe('http://proxy.local')
        })

        it('should flag OAuth as unavailable when redirect URI is not authorized', () => {
            console.log = vi.fn()
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: {
                    googleOauth: {
                        clientId: 'custom-client-id',
                        authorizedRedirects: [
                            { uri: 'http://other.host' }
                        ]
                    }
                }
            }))
            component.ngOnInit()
            expect(component.oauthUnavailable).toBe(true)
            expect(console.log).toHaveBeenCalled()
        })

        it('should log error when application configuration cannot be loaded', () => {
            console.log = vi.fn()
            configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith('Error')
        })
    })

    describe('login flow edge cases', () => {
        it('should redirect to the URL provided via the redirectUrl query parameter', async () => {
            const router = (component as any).router
            const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true as any)
            ;(component as any).route = { snapshot: { queryParamMap: { get: () => '/profile' } } }
            component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
            userService.login.mockReturnValue(of({ token: 't', bid: 1 }))
            await component.login()
            expect(navSpy).toHaveBeenCalledWith('/profile')
        })

        it('should log and continue when merging guest basket fails', async () => {
            console.log = vi.fn()
            basketService.mergeGuestBasketIntoUserBasket.mockReturnValue(throwError('mergeErr'))
            component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
            userService.login.mockReturnValue(of({ token: 't', bid: 1 }))
            await component.login()
            expect(console.log).toHaveBeenCalledWith('mergeErr')
            expect(basketService.updateNumberOfCartItems).toHaveBeenCalled()
        })

        it('should redirect to 2FA page when login requires a TOTP token', async () => {
            const router = (component as any).router
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any)
            component.loginModel.update((model) => ({ ...model, email: 'a@a', password: 'p' }))
            userService.login.mockReturnValue(throwError({
                error: { status: 'totp_token_required', data: { tmpToken: 'tmp' } }
            }))
            await component.login()
            expect(localStorage.getItem('totp_tmp_token')).toBe('tmp')
            expect(navSpy).toHaveBeenCalledWith(['/2fa/enter'])
            localStorage.removeItem('totp_tmp_token')
        })

        it('should redirect via window.location.replace on googleLogin', () => {
            component.clientId = 'cid'
            component.redirectUri = 'http://localhost:4200'
            component.googleLogin()
            expect(windowRefService.nativeWindow.location.replace).toHaveBeenCalled()
            const call = windowRefService.nativeWindow.location.replace.mock.calls[0][0] as string
            expect(call).toContain('client_id=cid')
            expect(call).toContain('redirect_uri=http://localhost:4200')
        })
    })
})
