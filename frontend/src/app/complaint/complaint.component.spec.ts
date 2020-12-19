/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FileItem, FileUploadModule } from 'ng2-file-upload'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'

import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { ComplaintComponent } from './complaint.component'
import { of, throwError } from 'rxjs'

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { EventEmitter } from '@angular/core'

describe('ComplaintComponent', () => {
  let component: ComplaintComponent
  let fixture: ComponentFixture<ComplaintComponent>
  let userService: any
  let complaintService: any
  let translateService

  beforeEach(async(() => {

    userService = jasmine.createSpyObj('UserService',['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    complaintService = jasmine.createSpyObj('ComplaintService', ['save'])
    complaintService.save.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        FileUploadModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ ComplaintComponent ],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ComplaintService, useValue: complaintService },
        { provide: TranslateService, useValue: translateService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplaintComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have customerControl as disabled', () => {
    expect(component.customerControl.disabled).toBe(true)
  })

  it('should be compulsory to provide a message', () => {
    component.messageControl.setValue('')
    expect(component.messageControl.valid).toBeFalsy()
    component.messageControl.setValue('aa')
    expect(component.messageControl.valid).toBe(true)
  })

  it('should have a message of maximum 160 characters', () => {
    let str: string = ''
    for (let i = 0;i < 161; i++) {
      str += 'a'
    }
    component.messageControl.setValue(str)
    expect(component.messageControl.valid).toBeFalsy()
    str = str.slice(1)
    component.messageControl.setValue(str)
    expect(component.messageControl.valid).toBe(true)
  })

  it('should reset form by calling resetForm', () => {
    component.messageControl.setValue('Message')
    component.resetForm()
    expect(component.messageControl.pristine).toBe(true)
    expect(component.messageControl.untouched).toBe(true)
    expect(component.messageControl.value).toBe('')
  })

  it('should miss complaint object if retrieving currently logged in user fails', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.complaint).toBeUndefined()
  }))

  it('should hold the user email of the currently logged in user', () => {
    userService.whoAmI.and.returnValue(of({ email: 'x@x.xx' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('x@x.xx')
  })

  it('should hold no email if current user is not logged in', () => {
    userService.whoAmI.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.userEmail).toBeUndefined()
    expect(component.customerControl.value).toBeUndefined()
  })

  it('should display support message with #id and reset complaint form on saving complaint', () => {
    complaintService.save.and.returnValue(of({ id: 42 }))
    translateService.get.and.returnValue(of('CUSTOMER_SUPPORT_COMPLAINT_REPLY'))
    component.uploader.queue[0] = null as unknown as FileItem
    component.save()
    expect(translateService.get).toHaveBeenCalledWith('CUSTOMER_SUPPORT_COMPLAINT_REPLY',{ ref: 42 })
  })

  it('should begin uploading file if it has been added on saving', fakeAsync(() => {
    component.uploader.queue[0] = new FileItem(component.uploader, new File([''], 'file.pdf', { 'type': 'application/pdf' }),{})
    spyOn(component.uploader.queue[0],'upload')
    component.save()
    expect(component.uploader.queue[0].upload).toHaveBeenCalled()
  }))
})
