/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { SearchResultComponent } from '../search-result/search-result.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UserService } from '../Services/user.service'
import { ConfigurationService } from '../Services/configuration.service'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NavbarComponent } from './navbar.component'
import { Location } from '@angular/common'

import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { AdministrationService } from '../Services/administration.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CookieModule, CookieService } from 'ngy-cookie'
import { SocketIoService } from '../Services/socket-io.service'
import { of, throwError } from 'rxjs'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { LoginGuard } from '../app.guard'
import { MatRadioModule } from '@angular/material/radio'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSearchBarComponent } from '../mat-search-bar/mat-search-bar.component'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { LanguagesService } from '../Services/languages.service'
import { BasketService } from '../Services/basket.service'
import { Subject } from 'rxjs'
import { environment } from '../../environments/environment'

class MockSocket {
    on(str: string, callback: any) {
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
    let languagesService: any
    let basketService: any
    let itemTotalSubject: Subject<number>

    beforeEach(async () => {
        administrationService = {
            getApplicationVersion: vi.fn().mockName("AdministrationService.getApplicationVersion")
        }
        administrationService.getApplicationVersion.mockReturnValue(of(undefined))
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
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
        challengeService = {
            find: vi.fn().mockName("ChallengeService.find")
        }
        challengeService.find.mockReturnValue(of([{ solved: false }]))
        cookieService = {
            remove: vi.fn().mockName("CookieService.remove"),
            get: vi.fn().mockName("CookieService.get"),
            put: vi.fn().mockName("CookieService.put")
        }
        cookieService.get.mockReturnValue('en')
        mockSocket = new MockSocket()
        socketIoService = {
            socket: vi.fn().mockName("SocketIoService.socket")
        }
        socketIoService.socket.mockReturnValue(mockSocket)
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode")
        }
        loginGuard.tokenDecode.mockReturnValue(of(true))
        languagesService = {
            getLanguages: vi.fn().mockName('LanguagesService.getLanguages')
        }
        languagesService.getLanguages.mockReturnValue(of([{ key: 'en', lang: 'English', shortKey: 'EN' }]))
        itemTotalSubject = new Subject<number>()
        basketService = {
            getItemTotal: vi.fn().mockName('BasketService.getItemTotal'),
            updateNumberOfCartItems: vi.fn().mockName('BasketService.updateNumberOfCartItems')
        }
        basketService.getItemTotal.mockReturnValue(itemTotalSubject.asObservable())

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'search', component: SearchResultComponent }
                ]),
                CookieModule.forRoot(),
                TranslateModule.forRoot(),
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
                MatRadioModule,
                MatSnackBarModule,
                NavbarComponent, SearchResultComponent, MatSearchBarComponent],
            providers: [
                { provide: AdministrationService, useValue: administrationService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: UserService, useValue: userService },
                { provide: ChallengeService, useValue: challengeService },
                { provide: CookieService, useValue: cookieService },
                { provide: SocketIoService, useValue: socketIoService },
                { provide: LoginGuard, useValue: loginGuard },
                { provide: LanguagesService, useValue: languagesService },
                { provide: BasketService, useValue: basketService },
                TranslateService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()

        location = TestBed.inject(Location)
        translateService = TestBed.inject(TranslateService)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent)
        component = fixture.componentInstance
        localStorage.removeItem('token')
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should hold application version', () => {
        administrationService.getApplicationVersion.mockReturnValue(of('x.y.z'))
        component.ngOnInit()
        expect(component.version).toBe('vx.y.z')
    })

    it('should show nothing on missing application version', () => {
        administrationService.getApplicationVersion.mockReturnValue(of(undefined))
        component.ngOnInit()
        expect(component.version).toBe('')
    })

    it('should show nothing on error retrieving application version', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        administrationService.getApplicationVersion.mockReturnValue(throwError('Error'))
        component.ngOnInit()
        expect(component.version).toBe('')
    })

    it('should log errors directly to browser console', () => {
        administrationService.getApplicationVersion.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should use default application name if not customized', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        component.ngOnInit()
        expect(component.applicationName).toBe('OWASP Juice Shop')
    })

    it('should use custom application name URL if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { name: 'name' } }))
        component.ngOnInit()
        expect(component.applicationName).toBe('name')
    })

    it('should set user email on page reload if user is authenticated', () => {
        userService.whoAmI.mockReturnValue(of({ email: 'dummy@dummy.com' }))
        localStorage.setItem('token', 'token')
        component.ngOnInit()
        expect(component.userEmail).toBe('dummy@dummy.com')
    })

    it('should set user email on getting logged in', () => {
        localStorage.removeItem('token')
        userService.getLoggedInState.mockReturnValue(of(true))
        userService.whoAmI.mockReturnValue(of({ email: 'dummy@dummy.com' }))
        component.ngOnInit()
        expect(component.userEmail).toBe('dummy@dummy.com')
    })

    it('should log errors directly to browser console when getting user failed', () => {
        userService.whoAmI.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should show GitHub button by default', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        component.ngOnInit()
        expect(component.showGitHubLink).toBe(true)
    })

    it('should hide GitHub ribbon if so configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { showGitHubLinks: false } }))
        component.ngOnInit()
        expect(component.showGitHubLink).toBe(false)
    })

    it('should log error while getting application configuration from backend API directly to browser console', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should hide Score Board menu item when corresponding challenge was not solved yet', () => {
        challengeService.find.mockReturnValue(of([{ solved: false }]))
        component.ngOnInit()
        expect(component.scoreBoardVisible).toBeFalsy()
    })

    it('should show Score Board menu item if corresponding challenge has been solved', () => {
        challengeService.find.mockReturnValue(of([{ solved: true }]))
        component.ngOnInit()
        expect(component.scoreBoardVisible).toBe(true)
    })

    it('forwards to search result with search query as URL parameter', async () => {
        component.search('lemon juice')
        await fixture.whenStable()
        expect(location.path()).toBe(encodeURI('/search?q=lemon juice'))
    })

    it('forwards to search result with empty search criteria if no search query is present', async () => {
        component.search('')
        await fixture.whenStable()
        expect(location.path()).toBe(encodeURI('/search'))
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

    it('should set selected a language', () => {
        vi.spyOn(translateService, 'use').mockImplementation((lang: any) => lang)
        component.changeLanguage('xx')
        expect(translateService.use).toHaveBeenCalledWith('xx')
    })

    describe('template rendering', () => {
        it('should render the toolbar with sidenav toggle, home button and search bar', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('mat-toolbar')).toBeTruthy()
            expect(compiled.querySelector('button[aria-label="Open Sidenav"]')).toBeTruthy()
            expect(compiled.querySelector('button[aria-label="Back to homepage"]')).toBeTruthy()
            expect(compiled.querySelector('#searchQuery')).toBeTruthy()
        })

        it('should call onToggleSidenav when the sidenav toggle button is clicked', () => {
            const spy = vi.spyOn(component, 'onToggleSidenav')
            const button = (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Open Sidenav"]') as HTMLButtonElement
            button.click()
            expect(spy).toHaveBeenCalled()
        })

        it('should render the basket button with the current itemTotal', () => {
            component.itemTotal = 7
            fixture.detectChanges()
            const counter = (fixture.nativeElement as HTMLElement).querySelector('.warn-notification')
            expect(counter?.textContent).toContain('7')
        })

        it('should render the application name in the home button', () => {
            component.applicationName = 'MyShop'
            fixture.detectChanges()
            const name = (fixture.nativeElement as HTMLElement).querySelector('.app-name')
            expect(name?.textContent).toContain('MyShop')
        })
    })

    describe('language handling', () => {
        const sampleLanguages = [
            { key: 'en', lang: 'English', shortKey: 'EN' },
            { key: 'de', lang: 'German', shortKey: 'DE' },
            { key: 'fr', lang: 'French', shortKey: 'FR' }
        ]

        it('should populate languages and filteredLanguages from LanguagesService', () => {
            languagesService.getLanguages.mockReturnValue(of(sampleLanguages))
            cookieService.get.mockReturnValue(undefined)
            component.ngOnInit()
            expect(component.languages).toEqual(sampleLanguages)
            expect(component.filteredLanguages).toEqual(sampleLanguages)
        })

        it('should reset filtered languages when search query is empty', () => {
            component.languages = [...sampleLanguages]
            component.languageSearchQuery = ''
            component.filterLanguages()
            expect(component.filteredLanguages).toEqual(sampleLanguages)
        })

        it('should filter languages by language name (case-insensitive)', () => {
            component.languages = [...sampleLanguages]
            component.languageSearchQuery = 'GERM'
            component.filterLanguages()
            expect(component.filteredLanguages).toEqual([sampleLanguages[1]])
        })

        it('should filter languages by language key', () => {
            component.languages = [...sampleLanguages]
            component.languageSearchQuery = 'fr'
            component.filterLanguages()
            expect(component.filteredLanguages).toEqual([sampleLanguages[2]])
        })

        it('should filter languages by short key', () => {
            component.languages = [...sampleLanguages]
            component.languageSearchQuery = 'de'
            component.filterLanguages()
            // 'de' matches German's key 'de' and shortKey 'DE'
            expect(component.filteredLanguages).toEqual([sampleLanguages[1]])
        })

        it('should return no match when filter query matches nothing', () => {
            component.languages = [...sampleLanguages]
            component.languageSearchQuery = 'xyz'
            component.filterLanguages()
            expect(component.filteredLanguages).toEqual([])
        })

        it('should apply stored language cookie on init', () => {
            languagesService.getLanguages.mockReturnValue(of(sampleLanguages))
            cookieService.get.mockReturnValue('de')
            vi.spyOn(translateService, 'use').mockImplementation((lang: any) => lang)
            component.ngOnInit()
            expect(translateService.use).toHaveBeenCalledWith('de')
            expect(component.shortKeyLang).toBe('DE')
        })

        it('should default to English when no language cookie is set', () => {
            languagesService.getLanguages.mockReturnValue(of(sampleLanguages))
            cookieService.get.mockReturnValue(undefined)
            vi.spyOn(translateService, 'use').mockImplementation((lang: any) => lang)
            component.ngOnInit()
            expect(component.shortKeyLang).toBe('EN')
        })

        it('should set selected language details when changeLanguage finds the language', () => {
            component.languages = [...sampleLanguages]
            vi.spyOn(translateService, 'use').mockImplementation((lang: any) => lang)
            component.changeLanguage('fr')
            expect(cookieService.put).toHaveBeenCalled()
            expect(component.shortKeyLang).toBe('FR')
        })

        it('should not update shortKeyLang when changeLanguage is called with unknown key', () => {
            component.languages = [...sampleLanguages]
            component.shortKeyLang = 'EN'
            vi.spyOn(translateService, 'use').mockImplementation((lang: any) => lang)
            component.changeLanguage('zz')
            expect(component.shortKeyLang).toBe('EN')
        })
    })

    describe('application configuration logo handling', () => {
        it('should use a relative logo path when configured', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { logo: 'my-logo.png' } }))
            component.ngOnInit()
            expect(component.logoSrc).toBe('assets/public/images/my-logo.png')
        })

        it('should extract and decode the file name when logo is an http URL', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { logo: 'https://example.com/path/my%20logo.png' } }))
            component.ngOnInit()
            expect(component.logoSrc).toBe('assets/public/images/my logo.png')
        })
    })

    describe('score board status', () => {
        it('should log error when fetching score board status fails', () => {
            challengeService.find.mockReturnValue(throwError('Error'))
            console.log = vi.fn()
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith('Error')
        })

        it('should make the score board visible when scoreBoardChallenge is solved via socket', () => {
            mockSocket.on = (event: string, cb: any) => {
                if (event === 'challenge solved') {
                    cb({ key: 'scoreBoardChallenge' })
                }
            }
            component.scoreBoardVisible = false
            component.ngOnInit()
            expect(component.scoreBoardVisible).toBe(true)
        })

        it('should ignore unrelated challenge solved events for score board visibility', () => {
            mockSocket.on = (event: string, cb: any) => {
                if (event === 'challenge solved') {
                    cb({ key: 'someOtherChallenge' })
                }
            }
            challengeService.find.mockReturnValue(of([{ solved: false }]))
            component.ngOnInit()
            expect(component.scoreBoardVisible).toBeFalsy()
        })
    })

    describe('miscellaneous behavior', () => {
        it('should update itemTotal when basket emits a new value', () => {
            component.ngOnInit()
            itemTotalSubject.next(42)
            expect(component.itemTotal).toBe(42)
        })

        it('should report isLoggedIn based on the auth token in localStorage', () => {
            localStorage.removeItem('token')
            expect(component.isLoggedIn()).toBeFalsy()
            localStorage.setItem('token', 'abc')
            expect(component.isLoggedIn()).toBe('abc')
            localStorage.removeItem('token')
        })

        it('should detect accounting role from the decoded token', () => {
            loginGuard.tokenDecode.mockReturnValue({ data: { role: 'accounting' } })
            expect(component.isAccounting()).toBe(true)
        })

        it('should not flag non-accounting users as accounting', () => {
            loginGuard.tokenDecode.mockReturnValue({ data: { role: 'customer' } })
            expect(component.isAccounting()).toBe(false)
        })

        it('should handle a missing token payload safely in isAccounting', () => {
            loginGuard.tokenDecode.mockReturnValue(undefined)
            expect(component.isAccounting()).toBeFalsy()
        })

        it('should navigate to the profile page via window.location.replace', () => {
            const originalLocation = window.location
            const replaceSpy = vi.fn()
            // jsdom: assigning location is forbidden, but we can delete + redefine
            delete (window as any).location
            ;(window as any).location = { ...originalLocation, replace: replaceSpy }
            component.goToProfilePage()
            expect(replaceSpy).toHaveBeenCalledWith(environment.hostServer + '/profile')
            ;(window as any).location = originalLocation
        })

        it('should navigate to the data erasure page via window.location.replace', () => {
            const originalLocation = window.location
            const replaceSpy = vi.fn()
            delete (window as any).location
            ;(window as any).location = { ...originalLocation, replace: replaceSpy }
            component.goToDataErasurePage()
            expect(replaceSpy).toHaveBeenCalledWith(environment.hostServer + '/dataerasure')
            ;(window as any).location = originalLocation
        })

        it('should emit a sidenavToggle event from onToggleSidenav', () => {
            const emitSpy = vi.spyOn(component.sidenavToggle, 'emit')
            component.onToggleSidenav()
            expect(emitSpy).toHaveBeenCalled()
        })

        it('should clear user email when user gets logged out', () => {
            component.userEmail = 'foo@bar.com'
            userService.getLoggedInState.mockReturnValue(of(false))
            component.ngOnInit()
            expect(component.userEmail).toBe('')
            expect(basketService.updateNumberOfCartItems).toHaveBeenCalled()
        })
    })
})
