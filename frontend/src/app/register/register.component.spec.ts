/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { LoginComponent } from '../login/login.component'
import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { RegisterComponent } from './register.component'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'
import { Location } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
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
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

describe('RegisterComponent', () => {
  let component: RegisterComponent
  let fixture: ComponentFixture<RegisterComponent>
  let securityAnswerService: any
  let securityQuestionService: any
  let userService: any
  let location: Location

  beforeEach(waitForAsync(() => {
    securityAnswerService = jasmine.createSpyObj('SecurityAnswerService', ['save'])
    securityAnswerService.save.and.returnValue(of({}))
    securityQuestionService = jasmine.createSpyObj('SecurityQuestionService', ['find'])
    securityQuestionService.find.and.returnValue(of([{}]))
    userService = jasmine.createSpyObj('UserService', ['save'])
    userService.save.and.returnValue(of({}))
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginComponent }
        ]),
        TranslateModule.forRoot(),
        MatPasswordStrengthModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
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
        MatSlideToggleModule
      ],
      declarations: [RegisterComponent, LoginComponent],
      providers: [
        { provide: SecurityAnswerService, useValue: securityAnswerService },
        { provide: SecurityQuestionService, useValue: securityQuestionService },
        { provide: UserService, useValue: userService }
      ]
    })
      .compileComponents()

    location = TestBed.inject(Location)
  }))

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
    let password: string = ''
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
    const password: string = 'aaaaa'
    const passwordRepeat: string = 'aaaaa'
    component.passwordControl.setValue(password)
    component.repeatPasswordControl.setValue('bbbbb')
    expect(component.repeatPasswordControl.valid).toBeFalsy()
    component.repeatPasswordControl.setValue(passwordRepeat)
    expect(component.repeatPasswordControl.valid).toBe(true)
  })

  it('redirects to login page after user registration', fakeAsync(() => {
    userService.save.and.returnValue(of({ id: 1, question: 'Wat is?' }))
    securityAnswerService.save.and.returnValue(of({}))
    component.securityQuestions = [{ id: 1, question: 'Wat is?' }]
    component.emailControl.setValue('x@x.xx')
    component.passwordControl.setValue('password')
    component.repeatPasswordControl.setValue('password')
    component.securityQuestionControl.setValue(1)
    component.securityAnswerControl.setValue('Answer')
    const user = { email: 'x@x.xx', password: 'password', passwordRepeat: 'password', securityQuestion: { id: 1, question: 'Wat is?' }, securityAnswer: 'Answer' }
    const securityAnswerObject = { UserId: 1, answer: 'Answer', SecurityQuestionId: 1 }
    component.save()
    tick()
    expect(userService.save.calls.argsFor(0)[0]).toEqual(user)
    expect(securityAnswerService.save.calls.argsFor(0)[0]).toEqual(securityAnswerObject)
    expect(location.path()).toBe('/login')
    fixture.destroy()
    flush()
  }))

  it('loading secret questions', () => {
    securityQuestionService.find.and.returnValue(of([{ id: 1, question: 'WTF?' }, { id: 2, question: 'WAT?' }]))
    component.ngOnInit()
    expect(component.securityQuestions.length).toBe(2)
    expect(component.securityQuestions[0].question).toBe('WTF?')
    expect(component.securityQuestions[1].question).toBe('WAT?')
  })

  it('should hold nothing when no secret questions exists', () => {
    securityQuestionService.find.and.returnValue(of(undefined))
    component.ngOnInit()
    expect(component.securityQuestions).toBeUndefined()
  })

  it('should log error from backend API on failing to get security questions', fakeAsync(() => {
    securityQuestionService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error on saving user', fakeAsync(() => {
    userService.save.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.save()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
