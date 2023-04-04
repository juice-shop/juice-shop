/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CaptchaService } from '../Services/captcha.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { UserService } from '../Services/user.service'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { EventEmitter } from '@angular/core'
import { ContactComponent } from './contact.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FeedbackService } from '../Services/feedback.service'
import { MatSliderModule } from '@angular/material/slider'
import { of, throwError } from 'rxjs'

describe('ContactComponent', () => {
  let component: ContactComponent
  let fixture: ComponentFixture<ContactComponent>
  let userService: any
  let feedbackService: any
  let captchaService: any
  let snackBar: any
  let translateService

  beforeEach(waitForAsync(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    userService = jasmine.createSpyObj('UserService', ['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    feedbackService = jasmine.createSpyObj('FeedbackService', ['save'])
    feedbackService.save.and.returnValue(of({}))
    captchaService = jasmine.createSpyObj('CaptchaService', ['getCaptcha'])
    captchaService.getCaptcha.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatSliderModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule
      ],
      declarations: [ContactComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: FeedbackService, useValue: feedbackService },
        { provide: CaptchaService, useValue: captchaService },
        { provide: TranslateService, useValue: translateService }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reinitizalise forms by calling resetForm', () => {
    component.feedbackControl.setValue('feedback')
    component.captchaControl.setValue('captcha')
    component.authorControl.setValue('author')
    component.resetForm()
    expect(component.feedbackControl.value).toBe('')
    expect(component.feedbackControl.pristine).toBe(true)
    expect(component.feedbackControl.untouched).toBe(true)
    expect(component.captchaControl.value).toBe('')
    expect(component.captchaControl.pristine).toBe(true)
    expect(component.captchaControl.untouched).toBe(true)
    expect(component.authorControl.value).toBe('')
    expect(component.authorControl.pristine).toBe(true)
    expect(component.authorControl.untouched).toBe(true)
  })

  it('author formControl should be disabled', () => {
    expect(component.authorControl.disabled).toBe(true)
  })

  it('should be compulsory to provide feedback', () => {
    component.feedbackControl.setValue('')
    expect(component.feedbackControl.valid).toBeFalsy()
  })

  it('feedback should not be more than 160 characters', () => {
    let str: string = ''
    for (let i = 0; i < 161; ++i) {
      str += 'a'
    }
    component.feedbackControl.setValue(str)
    expect(component.feedbackControl.valid).toBeFalsy()
    str = str.slice(1)
    component.feedbackControl.setValue(str)
    expect(component.feedbackControl.valid).toBe(true)
  })

  it('should be compulsory to answer the captcha', () => {
    component.captchaControl.setValue('')
    expect(component.captchaControl.valid).toBeFalsy()
    component.captchaControl.setValue('1')
    expect(component.captchaControl.valid).toBe(true)
  })

  it('should store the captcha and the captchaId on getting new captcha', () => {
    captchaService.getCaptcha.and.returnValue(of({ captcha: 'captcha', captchaId: 2 }))
    component.getNewCaptcha()
    expect(component.captcha).toBe('captcha')
    expect(component.captchaId).toBe(2)
  })

  it('should hold the user id of the currently logged in user', () => {
    userService.whoAmI.and.returnValue(of({ id: 42 }))
    component.ngOnInit()
    expect(component.userIdControl.value).toBe(42)
  })

  it('should hold no user id if current user is not logged in', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.userIdControl.value).toBeUndefined()
  }))

  it('should miss feedback object if retrieving currently logged in user fails', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.feedback).toBeUndefined()
  }))

  it('should log the error if retrieving currently logged in user fails', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold the anonymized email of the currently logged in user', () => {
    userService.whoAmI.and.returnValue(of({ email: 'xxxx@x.xx' }))
    component.ngOnInit()
    expect(component.authorControl.value).toBe('***x@x.xx')
  })

  it('should hold anonymous placeholder for email if current user is not logged in', () => {
    userService.whoAmI.and.returnValue(of({ user: {} }))
    component.ngOnInit()
    expect(component.authorControl.value).toBe('anonymous')
  })

  it('should populate the feedback object and send it via the feedback service on saving', () => {
    component.captchaId = 2
    component.captchaControl.setValue('2')
    component.feedbackControl.setValue('feedback')
    component.rating = 5
    component.userIdControl.setValue('2')
    component.save()
    expect(feedbackService.save).toHaveBeenCalledWith({ captchaId: 2, captcha: '2', comment: 'feedback (anonymous)', rating: 5, UserId: '2' })
  })

  it('should display thank-you message and reset feedback form on saving feedback', () => {
    feedbackService.save.and.returnValue(of({ rating: 4 }))
    spyOn(component, 'resetForm')
    spyOn(component, 'ngOnInit')
    component.save()
    expect(snackBar.open).toHaveBeenCalled()
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should display 5-star thank-you message and reset feedback form on saving 5-star feedback', () => {
    feedbackService.save.and.returnValue(of({ rating: 5 }))
    spyOn(component, 'resetForm')
    spyOn(component, 'ngOnInit')
    component.save()
    expect(snackBar.open).toHaveBeenCalled()
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should clear the form display error if saving feedback fails', fakeAsync(() => {
    feedbackService.save.and.returnValue(throwError({ error: 'Error' }))
    spyOn(component, 'resetCaptcha')
    component.save()
    expect(snackBar.open).toHaveBeenCalled()
    expect(component.resetCaptcha).toHaveBeenCalled()
  }))

  it('should clear the feedback object if saving feedback fails', fakeAsync(() => {
    feedbackService.save.and.returnValue(throwError({ error: 'Error' }))
    component.save()
    expect(component.feedback).toEqual({})
  }))
})
