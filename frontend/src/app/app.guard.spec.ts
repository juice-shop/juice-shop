/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { AccountingGuard, AdminGuard, DeluxeGuard, LoginGuard } from './app.guard'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { ErrorPageComponent } from './error-page/error-page.component'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('LoginGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: '403', component: ErrorPageComponent }
                ])],
            providers: [LoginGuard, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
    })

    it('should be created', () => {
        const guard = TestBed.inject(LoginGuard)

        expect(guard).toBeTruthy()
    })

    it('should open for authenticated users', () => {
        const guard = TestBed.inject(LoginGuard)

        localStorage.setItem('token', 'TOKEN')
        expect(guard.canActivate()).toBe(true)
    })

    it('should close for anonymous users', () => {
        const guard = TestBed.inject(LoginGuard)

        localStorage.removeItem('token')
        expect(guard.canActivate()).toBe(false)
    })

    it('returns payload from decoding a valid JWT', () => {
        const guard = TestBed.inject(LoginGuard)

        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
        expect(guard.tokenDecode()).toEqual({
            sub: '1234567890',
            name: 'John Doe',
            iat: 1516239022
        })
    })

    it('returns nothing when decoding an invalid JWT', () => {
        const guard = TestBed.inject(LoginGuard)

        localStorage.setItem('token', '12345.abcde')
        expect(guard.tokenDecode()).toBeNull()
    })

    it('returns nothing when decoding an non-existing JWT', () => {
        const guard = TestBed.inject(LoginGuard)

        localStorage.removeItem('token')
        expect(guard.tokenDecode()).toBeNull()
    })
})

describe('AdminGuard', () => {
    let loginGuard: any

    beforeEach(() => {
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode"),
            forbidRoute: vi.fn().mockName("LoginGuard.forbidRoute")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: '403', component: ErrorPageComponent }
                ])],
            providers: [
                AdminGuard,
                { provide: LoginGuard, useValue: loginGuard },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
    })

    it('should be created', () => {
        const guard = TestBed.inject(AdminGuard)

        expect(guard).toBeTruthy()
    })

    it('should open for admins', () => {
        const guard = TestBed.inject(AdminGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'admin' } })
        expect(guard.canActivate()).toBe(true)
    })

    it('should close for regular customers', () => {
        const guard = TestBed.inject(AdminGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should close for deluxe customers', () => {
        const guard = TestBed.inject(AdminGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'deluxe' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should close for accountants', () => {
        const guard = TestBed.inject(AdminGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'accounting' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })
})

describe('AccountingGuard', () => {
    let loginGuard: any

    beforeEach(() => {
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode"),
            forbidRoute: vi.fn().mockName("LoginGuard.forbidRoute")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: '403', component: ErrorPageComponent }
                ])],
            providers: [
                AccountingGuard,
                { provide: LoginGuard, useValue: loginGuard },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
    })

    it('should be created', () => {
        const guard = TestBed.inject(AccountingGuard)

        expect(guard).toBeTruthy()
    })

    it('should open for accountants', () => {
        const guard = TestBed.inject(AccountingGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'accounting' } })
        expect(guard.canActivate()).toBe(true)
    })

    it('should close for regular customers', () => {
        const guard = TestBed.inject(AccountingGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should close for deluxe customers', () => {
        const guard = TestBed.inject(AccountingGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'deluxe' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should close for admins', () => {
        const guard = TestBed.inject(AccountingGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'admin' } })
        expect(guard.canActivate()).toBe(false)
        expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })
})

describe('DeluxeGuard', () => {
    let loginGuard: any

    beforeEach(() => {
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: '403', component: ErrorPageComponent }
                ])],
            providers: [
                DeluxeGuard,
                { provide: LoginGuard, useValue: loginGuard },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
    })

    it('should be created', () => {
        const guard = TestBed.inject(DeluxeGuard)

        expect(guard).toBeTruthy()
    })

    it('should open for deluxe customers', () => {
        const guard = TestBed.inject(DeluxeGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'deluxe' } })
        expect(guard.isDeluxe()).toBe(true)
    })

    it('should close for regular customers', () => {
        const guard = TestBed.inject(DeluxeGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
        expect(guard.isDeluxe()).toBe(false)
    })

    it('should close for admins', () => {
        const guard = TestBed.inject(DeluxeGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'admin' } })
        expect(guard.isDeluxe()).toBe(false)
    })

    it('should close for accountants', () => {
        const guard = TestBed.inject(DeluxeGuard)

        loginGuard.tokenDecode.mockReturnValue({ data: { role: 'accounting' } })
        expect(guard.isDeluxe()).toBe(false)
    })
})
