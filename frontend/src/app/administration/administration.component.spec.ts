/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { UserDetailsComponent } from '../user-details/user-details.component'
import { FeedbackDetailsComponent } from '../feedback-details/feedback-details.component'

import { FeedbackService } from '../Services/feedback.service'
import { UserService } from '../Services/user.service'
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'

import { AdministrationComponent } from './administration.component'
import { MatTableModule } from '@angular/material/table'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'

describe('AdministrationComponent', () => {
  let component: AdministrationComponent
  let fixture: ComponentFixture<AdministrationComponent>
  let dialog: any
  let userService: any
  let feedbackService: any

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    userService = jasmine.createSpyObj('UserService',['find'])
    userService.find.and.returnValue(of([{ email: 'User1' }, { email: 'User2' }]))
    feedbackService = jasmine.createSpyObj('FeedbackService', ['find','del'])
    feedbackService.find.and.returnValue(of([{ comment: 'Feedback1' }, { comment: 'Feedback2' }]))
    feedbackService.del.and.returnValue(of(null))

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,

        MatTableModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        MatPaginatorModule,
        MatDividerModule,
        MatCardModule
      ],
      declarations: [ AdministrationComponent ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: UserService , useValue: userService },
        { provide: FeedbackService, useValue: feedbackService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should find all users via the UserService' , () => {
    component.findAllUsers()
    expect(component.userDataSource.data.length).toBe(2)
    expect(component.userDataSource.data[0].email).toMatch(/User1/)
    expect(component.userDataSource.data[1].email).toMatch(/User2/)
  })

  it('should give an error if UserService fails to find all users' , fakeAsync(() => {
    userService.find.and.returnValue(throwError('Error'))
    component.findAllUsers()

    tick()

    expect(component.error).toBe('Error')
  }))

  it('should find all feedbacks via FeedbackService', () => {
    component.findAllFeedbacks()
    expect(component.feedbackDataSource.data.length).toBe(2)
    expect(component.feedbackDataSource.data[0].comment).toMatch(/Feedback1/)
    expect(component.feedbackDataSource.data[1].comment).toMatch(/Feedback2/)
  })

  it('should give an error if FeedbackService fails to find all feedbacks' , fakeAsync(() => {
    feedbackService.find.and.returnValue(throwError('Error'))
    component.findAllFeedbacks()

    tick()

    expect(component.error).toBe('Error')
  }))

  it('should refresh all feedbacks after deletion', () => {
    spyOn(component,'findAllFeedbacks')
    component.deleteFeedback(1)
    expect(component.findAllFeedbacks).toHaveBeenCalled()
    expect(feedbackService.del).toHaveBeenCalledWith(1)
  })

  it('should give an error if FeedbackService fails to delete feedback', fakeAsync(() => {
    feedbackService.del.and.returnValue(throwError('Error'))
    component.deleteFeedback(1)

    tick()

    expect(component.error).toBe('Error')
  }))

  it('should open the UserDetailsComponent to show details' , () => {
    component.showUserDetail(1)
    expect(dialog.open).toHaveBeenCalledWith(UserDetailsComponent, { data: { id: 1 } })
  })

  it('should open the FeedbackDetailsComponent to show details' , () => {
    component.showFeedbackDetails('Feedback', 1)
    expect(dialog.open).toHaveBeenCalledWith(FeedbackDetailsComponent, { data: { feedback: 'Feedback', id: 1 } })
  })

  it('should have three columns in the user table', () => {
    expect(component.userColumns.length).toBe(3)
    expect(component.userColumns[0]).toBe('user')
    expect(component.userColumns[1]).toBe('email')
    expect(component.userColumns[2]).toBe('user_detail')
  })

  it('should have four columns in the feedback table' , () => {
    expect(component.feedbackColumns.length).toBe(4)
    expect(component.feedbackColumns[0]).toBe('user')
    expect(component.feedbackColumns[1]).toBe('comment')
    expect(component.feedbackColumns[2]).toBe('rating')
    expect(component.feedbackColumns[3]).toBe('remove')
  })
})
