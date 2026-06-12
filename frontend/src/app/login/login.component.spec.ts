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

    describe('template rendering', () => {
        it('should render the login heading, email and password inputs and the login button', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')?.textContent).toContain('Login')
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

        it('should show the error message banner when component.error is set', () => {
            component.error = 'Invalid credentials'
            fixture.detectChanges()
            const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.error')
            expect(errorEl?.textContent).toContain('Invalid credentials')
        })

        it('should hide the OAuth login section when oauthUnavailable is true', () => {
            component.oauthUnavailable = true
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('#loginButtonGoogle')).toBeNull()
            expect(compiled.querySelector('.breakLine')).toBeNull()
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
            userService.login.mockReturnValue(of({ token: 't', bid: 1 }))
            component.login()
            await fixture.whenStable()
            expect(navSpy).toHaveBeenCalledWith('/profile')
        })

        it('should log and continue when merging guest basket fails', async () => {
            console.log = vi.fn()
            basketService.mergeGuestBasketIntoUserBasket.mockReturnValue(throwError('mergeErr'))
            userService.login.mockReturnValue(of({ token: 't', bid: 1 }))
            component.login()
            await fixture.whenStable()
            expect(console.log).toHaveBeenCalledWith('mergeErr')
            expect(basketService.updateNumberOfCartItems).toHaveBeenCalled()
        })

        it('should redirect to 2FA page when login requires a TOTP token', async () => {
            const router = (component as any).router
            const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any)
            userService.login.mockReturnValue(throwError({
                error: { status: 'totp_token_required', data: { tmpToken: 'tmp' } }
            }))
            component.login()
            await fixture.whenStable()
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
