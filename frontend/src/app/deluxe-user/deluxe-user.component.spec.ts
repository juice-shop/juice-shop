/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'

import { of } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { DeluxeUserComponent } from './deluxe-user.component'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { LoginComponent } from '../login/login.component'
import { Location } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ConfigurationService } from '../Services/configuration.service'
import { throwError } from 'rxjs/internal/observable/throwError'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('DeluxeUserComponent', () => {
    let component: DeluxeUserComponent
    let fixture: ComponentFixture<DeluxeUserComponent>
    let userService
    let cookieService: any
    let configurationService: any

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        userService = {
            deluxeStatus: vi.fn().mockName("UserService.deluxeStatus"),
            upgradeToDeluxe: vi.fn().mockName("UserService.upgradeToDeluxe"),
            saveLastLoginIp: vi.fn().mockName("UserService.saveLastLoginIp")
        }
        userService.deluxeStatus.mockReturnValue(of({}))
        userService.upgradeToDeluxe.mockReturnValue(of({}))
        userService.isLoggedIn = {
            next: vi.fn().mockName("userService.isLoggedIn.next")
        }
        userService.isLoggedIn.next.mockReturnValue({})
        userService.saveLastLoginIp.mockReturnValue(of({}))
        cookieService = {
            remove: vi.fn().mockName("CookieService.remove")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'login', component: LoginComponent }
                ]),
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatCardModule,
                MatTableModule,
                MatFormFieldModule,
                MatInputModule,
                MatExpansionModule,
                MatDividerModule,
                MatRadioModule,
                MatDialogModule,
                MatIconModule,
                MatCheckboxModule,
                MatTooltipModule,
                DeluxeUserComponent, LoginComponent],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: CookieService, useValue: cookieService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
        TestBed.inject(Location)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(DeluxeUserComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should hold membership cost on ngOnInit', () => {
        userService.deluxeStatus.mockReturnValue(of({ membershipCost: 30 }))
        component.ngOnInit()
        expect(component.membershipCost).toEqual(30)
    })

    it('should set application name and logo as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { name: 'Name', logo: 'Logo' } }))
        component.ngOnInit()

        expect(component.applicationName).toBe('Name')
        expect(component.logoSrc).toBe('assets/public/images/Logo')
    })

    it('should assemble internal logo location from image base path and URL obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { logo: 'http://test.com/logo.jpg' } }))
        component.ngOnInit()

        expect(component.logoSrc).toBe('assets/public/images/logo.jpg')
    })

    it('should log error on failure in retrieving configuration from backend', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })
})
