/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { UserService } from '../Services/user.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ChangePasswordComponent } from './change-password.component'

import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent
    let fixture: ComponentFixture<ChangePasswordComponent>
    let userService: any

    const setModel = (values: { currentPassword?: string, newPassword?: string, repeatNewPassword?: string }) => {
        component.changePasswordModel.update((model) => ({ ...model, ...values }))
    }

    const submitForm = async () => {
        const form = (fixture.nativeElement as HTMLElement).querySelector('#password-form') as HTMLFormElement
        form.dispatchEvent(new Event('submit'))
        await fixture.whenStable()
        fixture.detectChanges()
    }

    beforeEach(async () => {
        userService = {
            changePassword: vi.fn().mockName("UserService.changePassword")
        }
        userService.changePassword.mockReturnValue(of({}))

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                ChangePasswordComponent],
            providers: [{ provide: UserService, useValue: userService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangePasswordComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should be compulsory to give password', () => {
        setModel({ currentPassword: '' })
        expect(component.changePasswordForm.currentPassword().valid()).toBeFalsy()
        setModel({ currentPassword: 'pass' })
        expect(component.changePasswordForm.currentPassword().valid()).toBe(true)
    })

    it('length of new password must be 5-40 characters', () => {
        setModel({ newPassword: 'old' })
        expect(component.changePasswordForm.newPassword().valid()).toBeFalsy()
        setModel({ newPassword: 'new password' })
        expect(component.changePasswordForm.newPassword().valid()).toBe(true)
        setModel({ newPassword: 'new password new password' })
        expect(component.changePasswordForm.newPassword().valid()).toBe(true)
        setModel({ newPassword: 'new password new password new password new password' })
        expect(component.changePasswordForm.newPassword().valid()).toBeFalsy()
    })

    it('should be compulsory to repeat new password', () => {
        setModel({ newPassword: '', repeatNewPassword: '' })
        expect(component.changePasswordForm.repeatNewPassword().valid()).toBeFalsy()
        setModel({ newPassword: 'passed', repeatNewPassword: 'passed' })
        expect(component.changePasswordForm.repeatNewPassword().valid()).toBe(true)
    })

    it('should reject a repeated password that differs from the new password', () => {
        setModel({ newPassword: 'happyPassword', repeatNewPassword: 'unhappyPassword' })
        expect(component.changePasswordForm.repeatNewPassword().getError('notSame')).toBeDefined()
    })

    it('should reinitizalise forms by calling resetForm', () => {
        setModel({ currentPassword: 'password', newPassword: 'newPassword', repeatNewPassword: 'newPassword' })
        component.changePasswordForm.currentPassword().markAsDirty()
        component.changePasswordForm.currentPassword().markAsTouched()
        component.resetForm()
        expect(component.changePasswordForm.currentPassword().value()).toBe('')
        expect(component.changePasswordForm.currentPassword().dirty()).toBe(false)
        expect(component.changePasswordForm.currentPassword().touched()).toBe(false)
        expect(component.changePasswordForm.newPassword().value()).toBe('')
        expect(component.changePasswordForm.newPassword().dirty()).toBe(false)
        expect(component.changePasswordForm.newPassword().touched()).toBe(false)
        expect(component.changePasswordForm.repeatNewPassword().value()).toBe('')
        expect(component.changePasswordForm.repeatNewPassword().dirty()).toBe(false)
        expect(component.changePasswordForm.repeatNewPassword().touched()).toBe(false)
    })

    it('should clear form and show confirmation after changing password', async () => {
        userService.changePassword.mockReturnValue(of({}))
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'foobar' })
        vi.spyOn(component, 'resetForm')
        await submitForm()
        expect(component.error()).toBeUndefined()
        expect(component.confirmation()).toBeDefined()
        expect(component.resetForm).toHaveBeenCalled()
        expect(userService.changePassword).toHaveBeenCalledWith({ current: 'old', new: 'foobar', repeat: 'foobar' })
    })

    it('should clear form and gracefully handle error on password change', async () => {
        userService.changePassword.mockReturnValue(throwError(() => 'Error'))
        vi.spyOn(component, 'resetErrorForm')
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'foobar' })
        await submitForm()
        expect(component.confirmation()).toBeUndefined()
        expect(component.error()).toBe('Error')
        expect(log).toHaveBeenCalledWith('Error')
        expect(component.resetErrorForm).toHaveBeenCalled()
        expect(component.changePasswordForm.currentPassword().value()).toBe('old')
        expect(component.changePasswordForm.newPassword().value()).toBe('')
        expect(component.changePasswordForm.repeatNewPassword().value()).toBe('')
        log.mockRestore()
    })

    it('should not change the password when the form is invalid', async () => {
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'unhappyPassword' })
        await submitForm()
        expect(userService.changePassword).not.toHaveBeenCalled()
        expect(component.confirmation()).toBeUndefined()
        expect(component.error()).toBeUndefined()
    })

    it('should show the mandatory errors and no confirmation when an empty form is submitted', async () => {
        fixture.detectChanges()
        const changeButton: HTMLButtonElement = fixture.nativeElement.querySelector('#changeButton')
        expect(changeButton.disabled).toBe(true)
        await submitForm()
        const errors = Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map((e: any) => e.textContent.trim())
        expect(errors).toContain('MANDATORY_CURRENT_PASSWORD')
        expect(errors).toContain('MANDATORY_NEW_PASSWORD')
        expect(errors).toContain('MANDATORY_PASSWORD_REPEAT')
        expect(fixture.nativeElement.querySelector('.confirmation')).toBeNull()
    })

    it('should display the confirmation after the password was changed and hide it again on further edits', async () => {
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'foobar' })
        await submitForm()
        const confirmation: HTMLElement = fixture.nativeElement.querySelector('.confirmation')
        expect(confirmation).toBeTruthy()
        expect(confirmation.getAttribute('role')).toBe('status')

        component.changePasswordForm.newPassword().markAsDirty()
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector('.confirmation')).toBeNull()
    })

    it('should display the error and hide the confirmation when the password change failed', async () => {
        userService.changePassword.mockReturnValue(throwError(() => 'Error'))
        vi.spyOn(console, 'log').mockImplementation(() => {})
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'foobar' })
        await submitForm()
        const error: HTMLElement = fixture.nativeElement.querySelector('.error')
        expect(error).toBeTruthy()
        expect(error.getAttribute('role')).toBe('alert')
        expect(error.textContent).toContain('Error')
        expect(fixture.nativeElement.querySelector('.confirmation')).toBeNull()
    })

    it('should count the characters entered into the new password fields', () => {
        setModel({ newPassword: 'foobar', repeatNewPassword: 'foobar' })
        fixture.detectChanges()
        const hints = Array.from(fixture.nativeElement.querySelectorAll('.mat-mdc-form-field-hint-end')).map((e: any) => e.textContent.trim())
        expect(hints).toEqual(['6/40', '6/20'])
    })

    it('should warn when the new password of a support team account violates the corporate password policy', async () => {
        localStorage.setItem('email', 'support@juice-sh.op')
        const log = vi.spyOn(console, 'error').mockImplementation(() => {})
        setModel({ currentPassword: 'old', newPassword: 'foobar', repeatNewPassword: 'foobar' })
        await submitForm()
        expect(log).toHaveBeenCalled()
        localStorage.removeItem('email')
        log.mockRestore()
    })

    it('should not warn when the new password of a support team account satisfies the corporate password policy', async () => {
        localStorage.setItem('email', 'support@juice-sh.op')
        const log = vi.spyOn(console, 'error').mockImplementation(() => {})
        setModel({ currentPassword: 'old', newPassword: 'CorporateP0licy!23', repeatNewPassword: 'CorporateP0licy!23' })
        await submitForm()
        expect(log).not.toHaveBeenCalled()
        localStorage.removeItem('email')
        log.mockRestore()
    })
})
