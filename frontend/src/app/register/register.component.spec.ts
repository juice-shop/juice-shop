/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { LoginComponent } from '../login/login.component'
import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { RegisterComponent } from './register.component'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'
import { Location } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { of, throwError } from 'rxjs'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('RegisterComponent', () => {
    let component: RegisterComponent
    let fixture: ComponentFixture<RegisterComponent>
    let securityAnswerService: any
    let securityQuestionService: any
    let userService: any
    let location: Location

    beforeEach(async () => {
        securityAnswerService = {
            save: vi.fn().mockName("SecurityAnswerService.save")
        }
        securityAnswerService.save.mockReturnValue(of({}))
        securityQuestionService = {
            find: vi.fn().mockName("SecurityQuestionService.find")
        }
        securityQuestionService.find.mockReturnValue(of([{}]))
        userService = {
            save: vi.fn().mockName("UserService.save")
        }
        userService.save.mockReturnValue(of({}))
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'login', component: LoginComponent }
                ]),
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatCardModule,
                MatFormFieldModule,
                MatCheckboxModule,
                MatInputModule,
                MatSelectModule,
                MatButtonModule,
                MatIconModule,
                MatSnackBarModule,
                MatTooltipModule,
                MatIconModule,
                MatSlideToggleModule,
                RegisterComponent, LoginComponent],
            providers: [
                { provide: SecurityAnswerService, useValue: securityAnswerService },
                { provide: SecurityQuestionService, useValue: securityQuestionService },
                { provide: UserService, useValue: userService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()

        location = TestBed.inject(Location)
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should be compulsory to provid email', () => {
        component.emailControl.setValue('')
        expect(component.emailControl.valid).toBeFalsy()
    })

    it('email field should be of proper format', () => {
        component.emailControl.setValue('email')
        expect(component.emailControl.valid).toBeFalsy()
        component.emailControl.setValue('x@x.xx')
        expect(component.emailControl.valid).toBe(true)
    })

    it('should be compulsory to provide password', () => {
        component.passwordControl.setValue('')
        expect(component.passwordControl.valid).toBeFalsy()
    })

    it('password should have at least five characters', () => {
        component.passwordControl.setValue('aaaa')
        expect(component.passwordControl.valid).toBeFalsy()
        component.passwordControl.setValue('aaaaa')
        expect(component.passwordControl.valid).toBe(true)
    })

    it('password should not be more than 20 characters', () => {
        let password = ''
        for (let i = 0; i < 41; i++) {
            password += 'a'
        }
        component.passwordControl.setValue(password)
        expect(component.passwordControl.valid).toBeFalsy()
        password = password.slice(1)
        component.passwordControl.setValue(password)
        expect(component.passwordControl.valid).toBe(true)
    })

    it('should be compulsory to repeat the password', () => {
        component.passwordControl.setValue('a')
        component.repeatPasswordControl.setValue('')
        expect(component.repeatPasswordControl.valid).toBeFalsy()
        component.repeatPasswordControl.setValue('a')
        expect(component.repeatPasswordControl.valid).toBe(true)
    })

    it('password and repeat password should be the same', () => {
        const password = 'aaaaa'
        const passwordRepeat = 'aaaaa'
        component.passwordControl.setValue(password)
        component.repeatPasswordControl.setValue('bbbbb')
        expect(component.repeatPasswordControl.valid).toBeFalsy()
        component.repeatPasswordControl.setValue(passwordRepeat)
        expect(component.repeatPasswordControl.valid).toBe(true)
    })

    it('redirects to login page after user registration', async () => {
        userService.save.mockReturnValue(of({ id: 1, question: 'Wat is?' }))
        securityAnswerService.save.mockReturnValue(of({}))
        component.securityQuestions = [{ id: 1, question: 'Wat is?' }]
        component.emailControl.setValue('x@x.xx')
        component.passwordControl.setValue('password')
        component.repeatPasswordControl.setValue('password')
        component.securityQuestionControl.setValue(1)
        component.securityAnswerControl.setValue('Answer')
        const user = { email: 'x@x.xx', password: 'password', passwordRepeat: 'password', securityQuestion: { id: 1, question: 'Wat is?' }, securityAnswer: 'Answer' }
        const securityAnswerObject = { UserId: 1, answer: 'Answer', SecurityQuestionId: 1 }
        component.save()
        await fixture.whenStable()
        expect(vi.mocked(userService.save).mock.calls[0][0]).toEqual(user)
        expect(vi.mocked(securityAnswerService.save).mock.calls[0][0]).toEqual(securityAnswerObject)
        expect(location.path()).toBe('/login')
        fixture.destroy()
    })

    it('loading secret questions', () => {
        securityQuestionService.find.mockReturnValue(of([{ id: 1, question: 'WTF?' }, { id: 2, question: 'WAT?' }]))
        component.ngOnInit()
        expect(component.securityQuestions.length).toBe(2)
        expect(component.securityQuestions[0].question).toBe('WTF?')
        expect(component.securityQuestions[1].question).toBe('WAT?')
    })

    it('should hold nothing when no secret questions exists', () => {
        securityQuestionService.find.mockReturnValue(of(undefined))
        component.ngOnInit()
        expect(component.securityQuestions).toBeUndefined()
    })

    it('should log error from backend API on failing to get security questions', () => {
        securityQuestionService.find.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error on saving user', () => {
        userService.save.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.save()
        expect(console.log).toHaveBeenCalledWith('Error')
    })
})
