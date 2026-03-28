/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { ConfigurationService } from '../Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngy-cookie'
import { LoginGuard } from '../app.guard'
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
    on(str: string, callback: any) {
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

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { welcomeBanner: {} }, hackingInstructor: {} }))
        challengeService = {
            find: vi.fn().mockName("ChallengeService.find")
        }
        challengeService.find.mockReturnValue(of([{ solved: false }]))
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI"),
            getLoggedInState: vi.fn().mockName("UserService.getLoggedInState"),
            saveLastLoginIp: vi.fn().mockName("UserService.saveLastLoginIp")
        }
        userService.whoAmI.mockReturnValue(of({}))
        userService.getLoggedInState.mockReturnValue(of(true))
        userService.saveLastLoginIp.mockReturnValue(of({}))
        userService.isLoggedIn = {
            next: vi.fn().mockName("userService.isLoggedIn.next")
        }
        userService.isLoggedIn.next.mockReturnValue({})
        administractionService = {
            getApplicationVersion: vi.fn().mockName("AdministrationService.getApplicationVersion")
        }
        administractionService.getApplicationVersion.mockReturnValue(of(null))
        cookieService = {
            remove: vi.fn().mockName("CookieService.remove"),
            get: vi.fn().mockName("CookieService.get"),
            put: vi.fn().mockName("CookieService.put")
        }
        mockSocket = new MockSocket()
        socketIoService = {
            socket: vi.fn().mockName("SocketIoService.socket")
        }
        socketIoService.socket.mockReturnValue(mockSocket)
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode")
        }
        loginGuard.tokenDecode.mockReturnValue({})

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
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
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(SidenavComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should show accounting functionality when user has according role', () => {
        loginGuard.tokenDecode.mockReturnValue({ data: { role: roles.accounting } })

        expect(component.isAccounting()).toBe(true)
    })

    it('should set version number as retrieved with "v" prefix', () => {
        loginGuard.tokenDecode.mockReturnValue({ data: { role: roles.accounting } })

        expect(component.isAccounting()).toBe(true)
    })

    it('should not show accounting functionality when user lacks according role', () => {
        administractionService.getApplicationVersion.mockReturnValue(of('1.2.3'))
        component.ngOnInit()

        expect(component.version).toBe('v1.2.3')
    })

    it('should hide Score Board link when Score Board was not discovered yet', () => {
        challengeService.find.mockReturnValue(of([{ name: 'Score Board', solved: false }]))
        component.getScoreBoardStatus()

        expect(component.scoreBoardVisible).toBe(false)
    })

    it('should show Score Board link when Score Board was already discovered', () => {
        challengeService.find.mockReturnValue(of([{ name: 'Score Board', solved: true }]))
        component.getScoreBoardStatus()

        expect(component.scoreBoardVisible).toBe(true)
    })

    it('should remove authentication token from localStorage', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.logout()
        expect(removeItemSpy).toHaveBeenCalledWith('token')
    })

    it('should remove authentication token from cookies', () => {
        component.logout()
        expect(cookieService.remove).toHaveBeenCalledWith('token')
    })

    it('should remove basket id from session storage', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.logout()
        expect(removeItemSpy).toHaveBeenCalledWith('bid')
    })

    it('should remove basket item total from session storage', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.logout()
        expect(removeItemSpy).toHaveBeenCalledWith('itemTotal')
    })

    it('should remove guest basket from session storage', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.logout()
        expect(removeItemSpy).toHaveBeenCalledWith('guestBasket')
    })

    it('should set the login status to be false via UserService', () => {
        component.logout()
        expect(userService.isLoggedIn.next).toHaveBeenCalledWith(false)
    })

    it('should save the last login IP address', () => {
        component.logout()
        expect(userService.saveLastLoginIp).toHaveBeenCalled()
    })

    it('should forward to main page', async () => {
        component.logout()
        await fixture.whenStable()
        expect(location.path()).toBe('/')
    })

    it('should handle error when getting scoreboard status', () => {
        challengeService.find.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.getScoreBoardStatus()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should handle error when getting user details', () => {
        userService.whoAmI.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.getUserDetails()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should handle error when getting application details', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.getApplicationDetails()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

})
