/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TwoFactorAuthComponent } from './two-factor-auth.component'

import { ReactiveFormsModule } from '@angular/forms'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { TranslateModule } from '@ngx-translate/core'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { TwoFactorAuthService } from '../Services/two-factor-auth-service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { throwError } from 'rxjs/internal/observable/throwError'
import { QrCodeComponent } from 'ng-qrcode'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { provideZoneChangeDetection } from '@angular/core'

describe('TwoFactorAuthComponent', () => {
    let component: TwoFactorAuthComponent
    let fixture: ComponentFixture<TwoFactorAuthComponent>
    let twoFactorAuthService: any
    let configurationService: any
    let snackBarHelperService: any

    beforeEach(async () => {
        twoFactorAuthService = {
            status: vi.fn().mockName("TwoFactorAuthService.status"),
            setup: vi.fn().mockName("TwoFactorAuthService.setup"),
            disable: vi.fn().mockName("TwoFactorAuthService.disable")
        }
        twoFactorAuthService.status.mockReturnValue(of({ setup: true, email: '', secret: '', setupToken: '' }))
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { name: 'OWASP Juice Shop' } }))
        snackBarHelperService = { open: vi.fn().mockName('SnackBarHelperService.open') }
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule,
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
                MatButtonModule,
                QrCodeComponent,
                MatSnackBarModule,
                MatTooltipModule,
                TwoFactorAuthComponent],
            providers: [
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TwoFactorAuthService, useValue: twoFactorAuthService },
                { provide: SnackBarHelperService, useValue: snackBarHelperService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                provideZoneChangeDetection()
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TwoFactorAuthComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should compile', () => {
        expect(component).toBeTruthy()
    })

    it('should set TOTP secret and URL if 2FA is not already set up', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { name: 'Test App' } }))
        twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: 'email', secret: 'secret', setupToken: '12345' }))

        component.updateStatus()

        expect(component.setupStatus).toBe(false)
        expect(component.totpUrl).toBe('otpauth://totp/Test%20App:email?secret=secret&issuer=Test%20App')
        expect(component.totpSecret).toBe('secret')
    })

    it('should not set TOTP secret and URL if 2FA is already set up', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { name: 'Test App' } }))
        twoFactorAuthService.status.mockReturnValue(of({ setup: true, email: 'email', secret: 'secret', setupToken: '12345' }))

        component.updateStatus()

        expect(component.setupStatus).toBe(true)
        expect(component.totpUrl).toBe(undefined)
        expect(component.totpSecret).toBe(undefined)
    })

    it('should confirm successful setup of 2FA', () => {
        twoFactorAuthService.setup.mockReturnValue(of({}))
        component.setupStatus = false
        component.twoFactorSetupForm.get('passwordControl').setValue('password')
        component.twoFactorSetupForm.get('initialTokenControl').setValue('12345')

        component.setup()

        expect(component.setupStatus).toBe(true)
        expect(twoFactorAuthService.setup).toHaveBeenCalledWith('password', '12345', undefined)
    })

    it('should reset and mark form as errored when 2FA setup fails', () => {
        twoFactorAuthService.setup.mockReturnValue(throwError(new Error('Error')))
        component.setupStatus = false
        component.errored = false
        component.twoFactorSetupForm.get('passwordControl').markAsDirty()
        component.twoFactorSetupForm.get('initialTokenControl').markAsDirty()

        expect(component.twoFactorSetupForm.get('passwordControl').pristine).toBe(false)
        expect(component.twoFactorSetupForm.get('initialTokenControl').pristine).toBe(false)
        component.setup()

        expect(component.setupStatus).toBe(false)
        expect(component.errored).toBe(true)
        expect(component.twoFactorSetupForm.get('passwordControl').pristine).toBe(true)
        expect(component.twoFactorSetupForm.get('initialTokenControl').pristine).toBe(true)
    })

    it('should confirm successfully disabling 2FA', () => {
        twoFactorAuthService.status.mockReturnValue(of({ setup: true, email: 'email', secret: 'secret', setupToken: '12345' }))
        twoFactorAuthService.disable.mockReturnValue(of({}))
        component.setupStatus = true
        component.twoFactorDisableForm.get('passwordControl').setValue('password')

        component.disable()

        expect(component.setupStatus).toBe(false)
        expect(twoFactorAuthService.disable).toHaveBeenCalledWith('password')
    })

    it('should reset and mark form as errored when disabling 2FA fails', () => {
        twoFactorAuthService.disable.mockReturnValue(throwError(new Error('Error')))
        component.setupStatus = true
        component.errored = false
        component.twoFactorDisableForm.get('passwordControl').markAsDirty()

        expect(component.twoFactorDisableForm.get('passwordControl').pristine).toBe(false)
        component.disable()

        expect(component.setupStatus).toBe(true)
        expect(component.errored).toBe(true)
        expect(component.twoFactorDisableForm.get('passwordControl').pristine).toBe(true)
    })

    it('should log when fetching 2FA status fails', () => {
        twoFactorAuthService.status.mockReturnValue(throwError(new Error('boom')))
        console.log = vi.fn()
        component.updateStatus()
        expect(console.log).toHaveBeenCalledWith('Failed to fetch 2fa status')
    })

    it('should open a confirmation snackbar after successful setup', () => {
        twoFactorAuthService.setup.mockReturnValue(of({}))
        component.setup()
        expect(snackBarHelperService.open).toHaveBeenCalledWith('CONFIRM_2FA_SETUP')
    })

    it('should open a confirmation snackbar after successful disable', () => {
        twoFactorAuthService.disable.mockReturnValue(of({}))
        twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: '', secret: '', setupToken: '' }))
        component.disable()
        expect(snackBarHelperService.open).toHaveBeenCalledWith('CONFIRM_2FA_DISABLE')
    })

    describe('template rendering', () => {
        it('should render the disable form when 2FA is already set up', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: true, email: '', secret: '', setupToken: '' }))
            component.updateStatus()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('[id="2fa-setup-successfully"]')).toBeTruthy()
            expect(compiled.querySelector('#two-factor-auth-disable')).toBeTruthy()
            expect(compiled.querySelector('#two-factor-auth-setup')).toBeNull()
        })

        it('should render the setup form with QR code when 2FA is not set up', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: 'e', secret: 's', setupToken: 't' }))
            component.updateStatus()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('#two-factor-auth-setup')).toBeTruthy()
            expect(compiled.querySelector('qr-code')).toBeTruthy()
            expect(compiled.querySelector('#initialToken')).toBeTruthy()
            expect(compiled.querySelector('#two-factor-auth-disable')).toBeNull()
        })

        it('should keep the setup submit button disabled while the setup form is invalid', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: 'e', secret: 's', setupToken: 't' }))
            component.updateStatus()
            fixture.detectChanges()
            const btn = (fixture.nativeElement as HTMLElement).querySelector('#setupTwoFactorAuth') as HTMLButtonElement
            expect(btn).toBeTruthy()
            expect(btn.disabled).toBe(true)
        })

        it('should keep the disable button disabled while the disable form is invalid', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: true, email: '', secret: '', setupToken: '' }))
            component.updateStatus()
            fixture.detectChanges()
            const btn = (fixture.nativeElement as HTMLElement).querySelector('#disableTwoFactorAuth') as HTMLButtonElement
            expect(btn).toBeTruthy()
            expect(btn.disabled).toBe(true)
        })

        it('should hide the setup-error message until errored is set and form is pristine', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: 'e', secret: 's', setupToken: 't' }))
            component.updateStatus()
            fixture.detectChanges()
            const setupForm = (fixture.nativeElement as HTMLElement).querySelector('#two-factor-auth-setup')
            const err = setupForm?.querySelector('.error') as HTMLElement
            expect(err.hidden).toBe(true)
            component.errored = true
            fixture.detectChanges()
            expect(err.hidden).toBe(false)
        })

        it('should expose the totpSecret to the initial token input via data attribute', () => {
            twoFactorAuthService.status.mockReturnValue(of({ setup: false, email: 'e', secret: 'super-secret', setupToken: 't' }))
            component.updateStatus()
            fixture.detectChanges()
            const input = (fixture.nativeElement as HTMLElement).querySelector('#initialToken') as HTMLInputElement
            expect(input.getAttribute('data-test-totp-secret')).toBe('super-secret')
        })
    })
})
