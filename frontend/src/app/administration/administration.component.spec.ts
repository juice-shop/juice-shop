import { UserDetailsComponent } from './../user-details/user-details.component'
import { BarRatingModule } from 'ng2-bar-rating'
import { FeedbackService } from './../Services/feedback.service'
import { RecycleService } from './../Services/recycle.service'
import { UserService } from './../Services/user.service'
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing'

import { AdministrationComponent } from './administration.component'
import { MatTableModule } from '@angular/material/table'
import { HttpClientModule } from '@angular/common/http'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'

describe('AdministrationComponent', () => {
  let component: AdministrationComponent
  let fixture: ComponentFixture<AdministrationComponent>
  let dialog
  let userService
  let recycleService
  let feedbackService

  beforeEach(async(() => {

    dialog = jasmine.createSpyObj('MatDialog',['open'])
    dialog.open.and.returnValue(null)
    userService = jasmine.createSpyObj('UserService',['find'])
    userService.find.and.returnValue(of([{ email: 'User1' }, { email: 'User2' }]))
    recycleService = jasmine.createSpyObj('RecycleService',['find'])
    recycleService.find.and.returnValue(of(['Recycle1','Recycle2']))
    feedbackService = jasmine.createSpyObj('FeedbackService', ['find','del'])
    feedbackService.find.and.returnValue(of([{ comment: 'Feedback1' }, { comment: 'Feedback2' }]))
    feedbackService.del.and.returnValue(of(null))

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BarRatingModule,
        MatTableModule,
        MatDialogModule
      ],
      declarations: [ AdministrationComponent ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: UserService , useValue: userService },
        { provide: RecycleService, useValue: recycleService },
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
    expect(component.userDataSource.length).toBe(2)
    expect(component.userDataSource[0].email).toMatch(/User1/)
    expect(component.userDataSource[1].email).toMatch(/User2/)
  })

  it('should give an error if UserService fails to find all users' , fakeAsync(() => {
    userService.find.and.returnValue(throwError('Error'))
    component.findAllUsers()

    tick()

    expect(component.error).toBe('Error')
  }))

  it('should find all recycles via the RecycleService', () => {
    component.findAllRecycles()
    expect(component.recycleDataSource.length).toBe(2)
    expect(component.recycleDataSource[0]).toBe('Recycle1')
    expect(component.recycleDataSource[1]).toBe('Recycle2')
  })

  it('should give an error if RecycleService fails to find all recycles' , fakeAsync(() => {
    recycleService.find.and.returnValue(throwError('Error'))
    component.findAllRecycles()

    tick()

    expect(component.error).toBe('Error')
  }))

  it('should find all feedbacks via FeedbackService', () => {
    component.findAllFeedbacks()
    expect(component.feedbackDataSource.length).toBe(2)
    expect(component.feedbackDataSource[0].comment).toMatch(/Feedback1/)
    expect(component.feedbackDataSource[1].comment).toMatch(/Feedback2/)
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

  it('should have three columns in the user table', () => {
    expect(component.userColumns.length).toBe(3)
    expect(component.userColumns[0]).toBe('user')
    expect(component.userColumns[1]).toBe('email')
    expect(component.userColumns[2]).toBe('user_detail')
  })

  it('should have five columns in the recycle table' , () => {
    expect(component.recycleColumns.length).toBe(5)
    expect(component.recycleColumns[0]).toBe('user')
    expect(component.recycleColumns[1]).toBe('quantity')
    expect(component.recycleColumns[2]).toBe('address')
    expect(component.recycleColumns[3]).toBe('icon')
    expect(component.recycleColumns[4]).toBe('pickup_date')
  })

  it('should have four columns in the feedback table' , () => {
    expect(component.feedbackColumns.length).toBe(4)
    expect(component.feedbackColumns[0]).toBe('user')
    expect(component.feedbackColumns[1]).toBe('comment')
    expect(component.feedbackColumns[2]).toBe('rating')
    expect(component.feedbackColumns[3]).toBe('remove')
  })
})
