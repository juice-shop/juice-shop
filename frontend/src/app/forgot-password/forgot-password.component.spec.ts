/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ForgotPasswordComponent } from './forgot-password.component'
import { SecurityQuestionService } from '../Services/security-question.service'

import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { UserService } from 'src/app/Services/user.service'
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

    beforeEach(async () => {
        securityQuestionService = {
            findBy: vi.fn().mockName("SecurityQuestionService.findBy")
        }
        securityQuestionService.findBy.mockReturnValue(of({}))
        userService = {
            resetPassword: vi.fn().mockName("UserService.resetPassword")
        }
        userService.resetPassword.mockReturnValue(of({}))

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                ReactiveFormsModule,
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
        component.emailControl.setValue('')
        expect(component.emailControl.valid).toBeFalsy()
    })

    it('should hold a valid email in the email field', () => {
        component.emailControl.setValue('aa')
        expect(component.emailControl.valid).toBeFalsy()
        component.emailControl.setValue('a@a')
        expect(component.emailControl.valid).toBe(true)
    })

    it('should be compulsory to answer to the security question', () => {
        vi.useFakeTimers()
        component.emailControl.setValue('a@a')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.securityQuestionControl.setValue('')
        expect(component.securityQuestionControl.valid).toBeFalsy()
        component.securityQuestionControl.setValue('Answer')
        expect(component.securityQuestionControl.valid).toBe(true)
        vi.useRealTimers()
    })

    it('should be compulsory to fill the password field', () => {
        component.passwordControl.setValue('')
        expect(component.passwordControl.valid).toBeFalsy()
    })

    it('should have a password length of at least five characters', () => {
        vi.useFakeTimers()
        component.emailControl.setValue('a@a')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.passwordControl.setValue('aaa')
        expect(component.passwordControl.valid).toBeFalsy()
        component.passwordControl.setValue('aaaaa')
        expect(component.passwordControl.valid).toBe(true)
        vi.useRealTimers()
    })

    it('should allow password length of more than twenty characters', () => {
        vi.useFakeTimers()
        component.emailControl.setValue('a@a')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.passwordControl.setValue('aaaaaaaaaaaaaaaaaaaaa')
        expect(component.passwordControl.valid).toBe(true)
        vi.useRealTimers()
    })

    it('should be compulsory to repeat the password', () => {
        vi.useFakeTimers()
        component.emailControl.setValue('a@a')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.passwordControl.setValue('a')
        component.repeatPasswordControl.setValue('')
        expect(component.repeatPasswordControl.valid).toBeFalsy()
        component.repeatPasswordControl.setValue('a')
        expect(component.repeatPasswordControl.valid).toBe(true)
        vi.useRealTimers()
    })

    it('should reset form on calling resetForm', () => {
        component.emailControl.setValue('email')
        component.securityQuestionControl.setValue('security question')
        component.passwordControl.setValue('password')
        component.repeatPasswordControl.setValue('repeat password')
        component.resetForm()
        expect(component.emailControl.pristine).toBe(true)
        expect(component.emailControl.untouched).toBe(true)
        expect(component.emailControl.value).toBe('')
        expect(component.securityQuestionControl.pristine).toBe(true)
        expect(component.securityQuestionControl.untouched).toBe(true)
        expect(component.securityQuestionControl.value).toBe('')
        expect(component.passwordControl.pristine).toBe(true)
        expect(component.passwordControl.untouched).toBe(true)
        expect(component.passwordControl.value).toBe('')
        expect(component.repeatPasswordControl.pristine).toBe(true)
        expect(component.repeatPasswordControl.untouched).toBe(true)
        expect(component.repeatPasswordControl.value).toBe('')
    })

    it('should clear form and show confirmation after changing password', () => {
        userService.resetPassword.mockReturnValue(of({}))
        vi.spyOn(component, 'resetForm')
        component.resetPassword()
        expect(component.confirmation).toBeDefined()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should clear form and gracefully handle error on password change', () => {
        userService.resetPassword.mockReturnValue(throwError({ error: 'Error' }))
        vi.spyOn(component, 'resetErrorForm')
        component.resetPassword()
        expect(component.error).toBe('Error')
        expect(component.resetErrorForm).toHaveBeenCalled()
    })

    it('should find the security question of a user with a known email address', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(of({ question: 'What is your favorite test tool?' }))
        component.emailControl.setValue('known@user.test')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.findSecurityQuestion()
        expect(component.securityQuestion).toBe('What is your favorite test tool?')
        vi.useRealTimers()
    })

    it('should not find the security question for an email address not bound to a user', () => {
        securityQuestionService.findBy.mockReturnValue(of({}))
        component.emailControl.setValue('unknown@user.test')
        component.findSecurityQuestion()
        expect(component.securityQuestion).toBeUndefined()
    })

    it('should not have a security question when lookup by email address failed', () => {
        vi.useFakeTimers()
        securityQuestionService.findBy.mockReturnValue(throwError('Error'))
        component.emailControl.setValue('some@user.test')
        vi.advanceTimersByTime(component.timeoutDuration)
        component.findSecurityQuestion()
        expect(component.securityQuestion).toBeUndefined()
        vi.useRealTimers()
    })

    it('should find not attempt to find security question for empty email address', () => {
        component.emailControl.setValue('')
        component.findSecurityQuestion()
        expect(securityQuestionService.findBy).not.toHaveBeenCalled()
    })
})
