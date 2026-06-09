/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { CookieModule, CookieService } from 'ngy-cookie'

import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeBannerComponent } from './welcome-banner.component'
import { MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { of, throwError } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('WelcomeBannerComponent', () => {
    let component: WelcomeBannerComponent
    let fixture: ComponentFixture<WelcomeBannerComponent>
    let cookieService: any
    let matDialogRef: any
    let configurationService: any

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        matDialogRef = {
            close: vi.fn().mockName("MatDialogRef.close")
        }
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                CookieModule.forRoot(),
                MatIconModule,
                MatTooltipModule,
                WelcomeBannerComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRef },
                { provide: ConfigurationService, useValue: configurationService },
                CookieService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()

        cookieService = TestBed.inject(CookieService)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(WelcomeBannerComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not dismiss if cookie not set', () => {
        component.ngOnInit()
        expect(matDialogRef.close).toHaveBeenCalledTimes(0)
    })

    it('should dismiss and add cookie when closed', () => {
        component.closeWelcome()
        expect(cookieService.get('welcomebanner_status')).toBe('dismiss')
        expect(matDialogRef.close).toHaveBeenCalled()
    })

    it('should dismiss and add cookie when starting hacking instructor', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(component as any, 'launchHackingInstructor').mockImplementation(() => {})
        component.startHackingInstructor()
        expect(cookieService.get('welcomebanner_status')).toBe('dismiss')
        expect(matDialogRef.close).toHaveBeenCalled()
    })

    it('should set banner properties as obtained from configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { welcomeBanner: { title: 'Title', message: 'Message' } } }))
        component.ngOnInit()

        expect(component.title).toBe('Title')
        expect(component.message).toBe('Message')
    })

    it('should show hacking instructor if enabled in configuration', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ hackingInstructor: { isEnabled: true } }))
        component.ngOnInit()

        expect(component.showHackingInstructor).toBe(true)
    })

    it('should prevent dismissing banner in tutorial mode', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ challenges: { restrictToTutorialsFirst: true }, hackingInstructor: { isEnabled: true } }))
        component.ngOnInit()

        expect(component.dialogRef.disableClose).toBe(true)
        expect(component.showDismissBtn).toBe(false)
    })

    it('should log error on failure in retrieving configuration from backend', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    describe('startHackingInstructor', () => {
        it('should close the welcome banner, log the start hint and launch the Score Board tutorial', () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
            const launchSpy = vi.spyOn(component as any, 'launchHackingInstructor').mockImplementation(() => {})
            component.startHackingInstructor()
            expect(matDialogRef.close).toHaveBeenCalled()
            expect(logSpy).toHaveBeenCalledWith('Starting instructions for challenge "Score Board"')
            expect(launchSpy).toHaveBeenCalledWith('Score Board')
        })
    })

    describe('template rendering', () => {
        it('should render the hacking instructor button only when showHackingInstructor is true', () => {
            component.showHackingInstructor = true
            component.showDismissBtn = true
            fixture.detectChanges()
            const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button')
            expect(buttons.length).toBe(2)
        })

        it('should hide the hacking instructor button when showHackingInstructor is false', () => {
            component.showHackingInstructor = false
            component.showDismissBtn = true
            fixture.detectChanges()
            const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button')
            expect(buttons.length).toBe(1)
            expect((fixture.nativeElement as HTMLElement).querySelector('button.close-dialog')).toBeTruthy()
        })

        it('should hide the dismiss button when showDismissBtn is false', () => {
            component.showHackingInstructor = true
            component.showDismissBtn = false
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('button.close-dialog')).toBeNull()
        })

        it('should call startHackingInstructor when the hacking instructor button is clicked', () => {
            component.showHackingInstructor = true
            fixture.detectChanges()
            const spy = vi.spyOn(component, 'startHackingInstructor').mockImplementation(() => {})
            const hackBtn = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement
            hackBtn.click()
            expect(spy).toHaveBeenCalled()
        })

        it('should render the configured title and message (interpreted as HTML)', () => {
            component.title = 'Hello Juice'
            component.message = '<em>welcome!</em>'
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')?.textContent).toContain('Hello Juice')
            expect(compiled.querySelector('em')?.textContent).toBe('welcome!')
        })
    })
})
