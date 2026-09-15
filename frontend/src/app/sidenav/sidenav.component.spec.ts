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

    describe('ngOnInit additional branches', () => {
        it('should log error when retrieving application version fails', () => {
            administractionService.getApplicationVersion.mockReturnValue(throwError('VersionError'))
            console.log = vi.fn()
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith('VersionError')
        })

        it('should clear userEmail when no token is stored on init', () => {
            localStorage.removeItem('token')
            userService.getLoggedInState.mockReturnValue(of(false))
            component.userEmail = 'stale@example.com'
            component.ngOnInit()
            expect(component.userEmail).toBe('')
        })

        it('should refresh user details when getLoggedInState emits true', () => {
            userService.getLoggedInState.mockReturnValue(of(true))
            userService.whoAmI.mockReturnValue(of({ email: 'me@example.com' }))
            component.ngOnInit()
            expect(component.userEmail).toBe('me@example.com')
        })

        it('should clear user email when getLoggedInState emits false', () => {
            userService.getLoggedInState.mockReturnValue(of(false))
            component.userEmail = 'stale@example.com'
            component.ngOnInit()
            expect(component.userEmail).toBe('')
        })
    })

    describe('socket subscription', () => {
        it('should set scoreBoardVisible to true when challenge solved is the scoreBoardChallenge', () => {
            const handlers: Record<string, (challenge: any) => void> = {}
            mockSocket.on = (event: string, cb: any) => { handlers[event] = cb }
            component.scoreBoardVisible = false
            component.ngOnInit()
            handlers['challenge solved']({ key: 'scoreBoardChallenge' })
            expect(component.scoreBoardVisible).toBe(true)
        })

        it('should not change scoreBoardVisible for unrelated challenge keys', () => {
            const handlers: Record<string, (challenge: any) => void> = {}
            mockSocket.on = (event: string, cb: any) => { handlers[event] = cb }
            component.scoreBoardVisible = false
            component.ngOnInit()
            handlers['challenge solved']({ key: 'somethingElse' })
            expect(component.scoreBoardVisible).toBe(false)
        })
    })

    describe('application configuration branches', () => {
        it('should apply custom application name from configuration', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: { name: 'My Shop', showGitHubLinks: false, welcomeBanner: { showOnFirstStart: true } },
                hackingInstructor: { isEnabled: true }
            }))
            component.getApplicationDetails()
            expect(component.applicationName).toBe('My Shop')
            expect(component.showGitHubLink).toBe(false)
            expect(component.offerScoreBoardTutorial).toBe(true)
        })

        it('should not offer score-board tutorial when hacking instructor is disabled', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: { name: 'My Shop', showGitHubLinks: true, welcomeBanner: { showOnFirstStart: true } },
                hackingInstructor: { isEnabled: false }
            }))
            component.getApplicationDetails()
            expect(component.offerScoreBoardTutorial).toBe(false)
        })
    })

    describe('navigation helpers', () => {
        it('should replace window.location with profile URL on goToProfilePage', () => {
            const replaceSpy = vi.fn()
            Object.defineProperty(window, 'location', {
                value: { replace: replaceSpy },
                writable: true,
                configurable: true
            })
            component.goToProfilePage()
            expect(replaceSpy).toHaveBeenCalled()
            expect(replaceSpy.mock.calls[0][0]).toContain('/profile')
        })

        it('should replace window.location with data-erasure URL on goToDataErasurePage', () => {
            const replaceSpy = vi.fn()
            Object.defineProperty(window, 'location', {
                value: { replace: replaceSpy },
                writable: true,
                configurable: true
            })
            component.goToDataErasurePage()
            expect(replaceSpy).toHaveBeenCalled()
            expect(replaceSpy.mock.calls[0][0]).toContain('/dataerasure')
        })

        it('should emit on onToggleSidenav', () => {
            const emitSpy = vi.spyOn(component.sidenavToggle, 'emit')
            component.onToggleSidenav()
            expect(emitSpy).toHaveBeenCalled()
        })
    })

    describe('isAccounting edge cases', () => {
        it('should return false when token payload has no role data', () => {
            loginGuard.tokenDecode.mockReturnValue(null)
            expect(component.isAccounting()).toBe(false)
        })

        it('should return false for a non-accounting role', () => {
            loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
            expect(component.isAccounting()).toBe(false)
        })
    })

    describe('logout error handling', () => {
        it('should log error when saveLastLoginIp fails', async () => {
            userService.saveLastLoginIp.mockReturnValue(throwError('Error'))
            console.log = vi.fn()
            component.logout()
            await fixture.whenStable()
            expect(console.log).toHaveBeenCalledWith('Error')
        })
    })

    describe('startHackingInstructor', () => {
        it('should emit toggle and log when starting the instructor for the Score Board', async () => {
            const emitSpy = vi.spyOn(component.sidenavToggle, 'emit')
            const launchSpy = vi.spyOn(component as any, 'launchHackingInstructor').mockImplementation(() => {})
            console.log = vi.fn()
            component.startHackingInstructor()
            expect(emitSpy).toHaveBeenCalled()
            expect(console.log).toHaveBeenCalledWith('Starting instructions for challenge "Score Board"')
            expect(launchSpy).toHaveBeenCalledWith('Score Board')
        })
    })

    describe('template rendering', () => {
        it('should render the toolbar with the application name and a navigation list', () => {
            component.applicationName = 'JuiceShop'
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('mat-toolbar h2')?.textContent).toContain('JuiceShop')
            expect(compiled.querySelector('mat-nav-list')).toBeTruthy()
        })

        it('should render the login entry when the user is not logged in', () => {
            localStorage.removeItem('token')
            fixture.detectChanges()
            const loginLink = (fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Go to login page"]')
            expect(loginLink).toBeTruthy()
        })

        it('should render the user profile entry instead of the login entry when the user is logged in', () => {
            localStorage.setItem('token', 'token')
            component.userEmail = 'user@juice-sh.op'
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Go to user profile"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to login page"]')).toBeNull()
            localStorage.removeItem('token')
        })

        it('should render the accounting entry only when user is logged in and has the accounting role', () => {
            localStorage.setItem('token', 'token')
            loginGuard.tokenDecode.mockReturnValue({ data: { role: roles.accounting } })
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Go to accounting page"]')).toBeTruthy()
            localStorage.removeItem('token')
        })

        it('should not render the accounting entry for non-accounting users', () => {
            localStorage.setItem('token', 'token')
            loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Go to accounting page"]')).toBeNull()
            localStorage.removeItem('token')
        })

        it('should render the orders-and-payment parent and expand its submenu on click', () => {
            localStorage.setItem('token', 'token')
            fixture.detectChanges()
            const parent = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Show Orders and Payment Menu"]') as HTMLElement
            expect(parent).toBeTruthy()
            parent.click()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Go to order history page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to recycling page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to saved address page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to saved payment methods page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to wallet page"]')).toBeTruthy()
            localStorage.removeItem('token')
        })

        it('should render the privacy-and-security parent and expand its submenu on click', () => {
            localStorage.setItem('token', 'token')
            fixture.detectChanges()
            const parent = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Show Privacy and Security Menu"]') as HTMLElement
            expect(parent).toBeTruthy()
            parent.click()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Go to privacy policy page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to data export page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to data subject page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to change password page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to two factor authentication page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to last login ip page"]')).toBeTruthy()
            localStorage.removeItem('token')
        })

        it('should render logout, complain and deluxe-membership entries when logged in', () => {
            localStorage.setItem('token', 'token')
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Logout"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to complain page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to deluxe membership page"]')).toBeTruthy()
            localStorage.removeItem('token')
        })

        it('should not render logged-in-only entries when no token is stored', () => {
            localStorage.removeItem('token')
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Logout"]')).toBeNull()
            expect(compiled.querySelector('a[aria-label="Go to complain page"]')).toBeNull()
            expect(compiled.querySelector('a[aria-label="Go to deluxe membership page"]')).toBeNull()
        })

        it('should always render contact, AI chat, about and photo wall entries', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Go to contact us page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to AI chat page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to about us page"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Go to photo wall"]')).toBeTruthy()
        })

        it('should render the score-board link when scoreBoardVisible is true', () => {
            component.scoreBoardVisible = true
            component.offerScoreBoardTutorial = false
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Open score-board"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Launch beginners tutorial"]')).toBeNull()
        })

        it('should render the beginners tutorial entry when score board is hidden and tutorial is offered', () => {
            component.scoreBoardVisible = false
            component.offerScoreBoardTutorial = true
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('a[aria-label="Launch beginners tutorial"]')).toBeTruthy()
            expect(compiled.querySelector('a[aria-label="Open score-board"]')).toBeNull()
        })

        it('should render the GitHub link when showGitHubLink is true', () => {
            component.showGitHubLink = true
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Go to OWASP Juice Shop GitHub page"]')).toBeTruthy()
        })

        it('should not render the GitHub link when showGitHubLink is false', () => {
            component.showGitHubLink = false
            component.scoreBoardVisible = false
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Go to OWASP Juice Shop GitHub page"]')).toBeNull()
        })

        it('should render the application name and version in the footer', () => {
            component.applicationName = 'JuiceShop'
            component.version = 'v1.2.3'
            fixture.detectChanges()
            const footer = (fixture.nativeElement as HTMLElement).querySelector('.appVersion')
            expect(footer?.querySelector('.app-name')?.textContent).toContain('JuiceShop')
            expect(footer?.querySelector('.app-version')?.textContent).toContain('v1.2.3')
        })
    })
})
