/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ForgotPasswordComponent } from './forgot-password.component'
import { SecurityQuestionService } from '../Services/security-question.service'

import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { UserService } from '../../app/Services/user.service'
import { of, throwError } from 'rxjs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent
    let fixture: ComponentFixture<ForgotPasswordComponent>
    let securityQuestionService: any
    let userService: any

    const setModel = (values: { email?: string, securityQuestion?: string, password?: string, repeatPassword?: string }) => {
        component.forgotPasswordModel.update((model) => ({ ...model, ...values }))
    }

    beforeEach(async () => {
        securityQuestionService = {
            findBy: vi.fn().mockName("SecurityQuestionService.findBy")
        }
        securityQuestionService.findBy.mockReturnValue(of(undefined))
        userService = {
            resetPassword: vi.fn().mockName("UserService.resetPassword")
        }
        userService.resetPassword.mockReturnValue(of({}))

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatTooltipModule,
                MatIconModule,
                MatSlideToggleModule,
                ForgotPasswordComponent],
            providers: [
                { provide: SecurityQuestionService, useValue: securityQuestionService },
                { provide: UserService, useValue: userService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(ForgotPasswordComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should be compulsory to fill the email field', () => {
        setModel({ email: '' })
        expect(component.forgotPasswordForm.email().valid()).toBeFalsy()
    })

    it('should hold a valid email in the email field', () => {
        setModel({ email: 'aa' })
        expect(component.forgotPasswordForm.email().valid()).toBeFalsy()
        setModel({ email: 'user@test.test' })
        expect(component.forgotPasswordForm.email().valid()).toBe(true)
    })

    it('should be compulsory to answer to the security question', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ securityQuestion: '' })
        expect(component.forgotPasswordForm.securityQuestion().valid()).toBeFalsy()
        setModel({ securityQuestion: 'Answer' })
        expect(component.forgotPasswordForm.securityQuestion().valid()).toBe(true)
    })

    it('should disable the security question and password fields until a security question is found', () => {
        expect(component.forgotPasswordForm.securityQuestion().disabled()).toBe(true)
        expect(component.forgotPasswordForm.password().disabled()).toBe(true)
        expect(component.forgotPasswordForm.repeatPassword().disabled()).toBe(true)
        component.securityQuestion.set('What is your favorite test tool?')
        expect(component.forgotPasswordForm.securityQuestion().disabled()).toBe(false)
        expect(component.forgotPasswordForm.password().disabled()).toBe(false)
        expect(component.forgotPasswordForm.repeatPassword().disabled()).toBe(false)
    })

    it('should be compulsory to fill the password field', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ password: '' })
        expect(component.forgotPasswordForm.password().valid()).toBeFalsy()
    })

    it('should have a password length of at least five characters', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ password: 'aaa' })
        expect(component.forgotPasswordForm.password().valid()).toBeFalsy()
        setModel({ password: 'aaaaa' })
        expect(component.forgotPasswordForm.password().valid()).toBe(true)
    })

    it('should allow password length of more than twenty characters', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ password: 'aaaaaaaaaaaaaaaaaaaaa' })
        expect(component.forgotPasswordForm.password().valid()).toBe(true)
    })

    it('should be compulsory to repeat the password', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ password: 'a', repeatPassword: '' })
        expect(component.forgotPasswordForm.repeatPassword().valid()).toBeFalsy()
        setModel({ repeatPassword: 'a' })
        expect(component.forgotPasswordForm.repeatPassword().valid()).toBe(true)
    })

    it('should reject a repeated password that does not match the password', () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ password: 'password', repeatPassword: 'different' })
        expect(component.forgotPasswordForm.repeatPassword().getError('notSame')).toBeDefined()
    })

    it('should reset form on calling resetForm', () => {
        setModel({ email: 'email', securityQuestion: 'security answer', password: 'password', repeatPassword: 'password' })
        component.forgotPasswordForm.email().markAsDirty()
        component.forgotPasswordForm.email().markAsTouched()
        component.resetForm()
        expect(component.forgotPasswordForm.email().value()).toBe('')
        expect(component.forgotPasswordForm.email().dirty()).toBe(false)
        expect(component.forgotPasswordForm.email().touched()).toBe(false)
        expect(component.forgotPasswordForm.securityQuestion().value()).toBe('')
        expect(component.forgotPasswordForm.password().value()).toBe('')
        expect(component.forgotPasswordForm.repeatPassword().value()).toBe('')
    })

    it('should clear form and show confirmation after changing password', async () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ email: 'user@test.test', securityQuestion: 'Answer', password: 'password', repeatPassword: 'password' })
        vi.spyOn(component, 'resetForm')
        await component.resetPassword()
        expect(component.confirmation()).toBeDefined()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should clear form and gracefully handle error on password change', async () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ email: 'user@test.test', securityQuestion: 'Answer', password: 'password', repeatPassword: 'password' })
        userService.resetPassword.mockReturnValue(throwError(() => ({ error: 'Error' })))
        vi.spyOn(component, 'resetErrorForm')
        await component.resetPassword()
        expect(component.error()).toBe('Error')
        expect(component.resetErrorForm).toHaveBeenCalled()
        expect(component.forgotPasswordForm.email().value()).toBe('user@test.test')
        expect(component.forgotPasswordForm.password().value()).toBe('')
    })

    it('should change the password when the form is submitted', async () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ email: 'user@test.test', securityQuestion: 'Answer', password: 'password', repeatPassword: 'password' })
        fixture.detectChanges()
        const resetButton: HTMLButtonElement = fixture.nativeElement.querySelector('#resetButton')
        expect(resetButton.disabled).toBe(false)
        const form = (fixture.nativeElement as HTMLElement).querySelector('#forgot-password-form') as HTMLFormElement
        form.dispatchEvent(new Event('submit'))
        await fixture.whenStable()
        expect(userService.resetPassword).toHaveBeenCalledWith({
            email: 'user@test.test',
            answer: 'Answer',
            new: 'password',
            repeat: 'password'
        })
        expect(component.confirmation()).toBeDefined()
    })

    it('should show the confirmation once the password was changed and hide it again on further edits', async () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ email: 'user@test.test', securityQuestion: 'Answer', password: 'password', repeatPassword: 'password' })
        await component.resetPassword()
        fixture.detectChanges()
        const confirmation: HTMLElement = fixture.nativeElement.querySelector('.confirmation')
        expect(confirmation.hidden).toBe(false)

        component.forgotPasswordForm.email().markAsDirty()
        fixture.detectChanges()
        expect(confirmation.hidden).toBe(true)
    })

    it('should show the error and hide the confirmation when the password change failed', async () => {
        component.securityQuestion.set('What is your favorite test tool?')
        setModel({ email: 'user@test.test', securityQuestion: 'Answer', password: 'password', repeatPassword: 'password' })
        userService.resetPassword.mockReturnValue(throwError(() => ({ error: 'Error' })))
        await component.resetPassword()
        fixture.detectChanges()
        const error: HTMLElement = fixture.nativeElement.querySelector('.error')
        const confirmation: HTMLElement = fixture.nativeElement.querySelector('.confirmation')
        expect(error.hidden).toBe(false)
        expect(error.textContent).toContain('Error')
        expect(confirmation.hidden).toBe(true)
    })

    it('should look up the security question when an email address is entered', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(of({ question: 'What is your favorite test tool?' }))
        const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('#email')
        emailInput.value = 'known@user.test'
        emailInput.dispatchEvent(new Event('input'))
        vi.advanceTimersByTime(component.timeoutDuration)
        expect(securityQuestionService.findBy).toHaveBeenCalledWith('known@user.test')
        expect(component.securityQuestion()).toBe('What is your favorite test tool?')
        vi.useRealTimers()
    })

    it('should find the security question of a user with a known email address', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(of({ question: 'What is your favorite test tool?' }))
        setModel({ email: 'known@user.test' })
        component.findSecurityQuestion()
        vi.advanceTimersByTime(component.timeoutDuration)
        expect(component.securityQuestion()).toBe('What is your favorite test tool?')
        vi.useRealTimers()
    })

    it('should not find the security question for an email address not bound to a user', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(of(undefined))
        setModel({ email: 'unknown@user.test' })
        component.findSecurityQuestion()
        vi.advanceTimersByTime(component.timeoutDuration)
        expect(component.securityQuestion()).toBeUndefined()
        vi.useRealTimers()
    })

    it('should not have a security question when lookup by email address failed', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(throwError(() => 'Error'))
        setModel({ email: 'some@user.test' })
        component.findSecurityQuestion()
        vi.advanceTimersByTime(component.timeoutDuration)
        expect(component.securityQuestion()).toBeUndefined()
        vi.useRealTimers()
    })

    it('should not attempt to find security question for empty email address', () => {
        vi.useFakeTimers()
        setModel({ email: '' })
        component.findSecurityQuestion()
        vi.advanceTimersByTime(component.timeoutDuration)
        expect(securityQuestionService.findBy).not.toHaveBeenCalled()
        vi.useRealTimers()
    })
})
