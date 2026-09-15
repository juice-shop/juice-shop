/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserDetailsComponent } from '../user-details/user-details.component'
import { FeedbackDetailsComponent } from '../feedback-details/feedback-details.component'

import { FeedbackService } from '../Services/feedback.service'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngy-cookie'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { AdministrationComponent } from './administration.component'
import { MatTableModule } from '@angular/material/table'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { TranslateModule } from '@ngx-translate/core'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AdministrationComponent', () => {
    let component: AdministrationComponent
    let fixture: ComponentFixture<AdministrationComponent>
    let dialog: any
    let userService: any
    let feedbackService: any
    let cookieService: any

    beforeEach(async () => {
        dialog = {
            open: vi.fn().mockName("MatDialog.open")
        }
        dialog.open.mockReturnValue(null)
        userService = {
            find: vi.fn().mockName("UserService.find")
        }
        userService.find.mockReturnValue(of([{ email: 'User1' }, { email: 'User2' }]))
        feedbackService = {
            find: vi.fn().mockName("FeedbackService.find"),
            del: vi.fn().mockName("FeedbackService.del")
        }
        feedbackService.find.mockReturnValue(of([{ comment: 'Feedback1' }, { comment: 'Feedback2' }]))
        feedbackService.del.mockReturnValue(of(null))
        cookieService = {
            get: vi.fn().mockName("CookieService.get"),
            put: vi.fn().mockName("CookieService.put")
        }
        cookieService.get.mockReturnValue('false')

        TestBed.configureTestingModule({
            imports: [MatTableModule,
                TranslateModule.forRoot(),
                MatDialogModule,
                MatPaginatorModule,
                MatDividerModule,
                MatCardModule,
                MatIconModule,
                AdministrationComponent],
            providers: [
                { provide: MatDialog, useValue: dialog },
                { provide: UserService, useValue: userService },
                { provide: FeedbackService, useValue: feedbackService },
                { provide: CookieService, useValue: cookieService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(AdministrationComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should find all users via the UserService', () => {
        component.findAllUsers()
        expect(component.userDataSource.data.length).toBe(2)
        expect(component.userDataSource.data[0].email.toString()).toContain('User1')
        expect(component.userDataSource.data[1].email.toString()).toContain('User2')
    })

    it('should give an error if UserService fails to find all users', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        userService.find.mockReturnValue(throwError('Error'))
        component.findAllUsers()

        expect(component.error).toBe('Error')
    })

    it('should find all feedbacks via FeedbackService', () => {
        component.findAllFeedbacks()
        expect(component.feedbackDataSource.data.length).toBe(2)
        expect(component.feedbackDataSource.data[0].comment.toString()).toContain('Feedback1')
        expect(component.feedbackDataSource.data[1].comment.toString()).toContain('Feedback2')
    })

    it('should give an error if FeedbackService fails to find all feedbacks', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        feedbackService.find.mockReturnValue(throwError('Error'))
        component.findAllFeedbacks()

        expect(component.error).toBe('Error')
    })

    it('should refresh all feedbacks after deletion', () => {
        vi.spyOn(component, 'findAllFeedbacks')
        component.deleteFeedback(1)
        expect(component.findAllFeedbacks).toHaveBeenCalled()
        expect(feedbackService.del).toHaveBeenCalledWith(1)
    })

    it('should give an error if FeedbackService fails to delete feedback', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        feedbackService.del.mockReturnValue(throwError('Error'))
        component.deleteFeedback(1)

        expect(component.error).toBe('Error')
    })

    it('should open the UserDetailsComponent to show details', () => {
        component.showUserDetail(1)
        expect(dialog.open).toHaveBeenCalledWith(UserDetailsComponent, { data: { id: 1 } })
    })

    it('should open the FeedbackDetailsComponent to show details', () => {
        component.showFeedbackDetails('Feedback', 1)
        expect(dialog.open).toHaveBeenCalledWith(FeedbackDetailsComponent, { data: { feedback: 'Feedback', id: 1 } })
    })

    it('should have three columns in the user table', () => {
        expect(component.userColumns.length).toBe(3)
        expect(component.userColumns[0]).toBe('user')
        expect(component.userColumns[1]).toBe('email')
        expect(component.userColumns[2]).toBe('user_detail')
    })

    it('should have four columns in the feedback table', () => {
        expect(component.feedbackColumns.length).toBe(4)
        expect(component.feedbackColumns[0]).toBe('user')
        expect(component.feedbackColumns[1]).toBe('comment')
        expect(component.feedbackColumns[2]).toBe('rating')
        expect(component.feedbackColumns[3]).toBe('remove')
    })

    it('should initialize showToolCalls based on cookie', () => {
        cookieService.get.mockReturnValue('true')
        component.ngOnInit()
        expect(component.showToolCalls()).toBe(true)

        cookieService.get.mockReturnValue('false')
        component.ngOnInit()
        expect(component.showToolCalls()).toBe(false)
    })

    it('should toggle showToolCalls and update cookie', () => {
        component.toggleShowToolCalls({ checked: true })
        expect(component.showToolCalls()).toBe(true)
        expect(cookieService.put).toHaveBeenCalledWith('show_tool_calls', 'true', expect.any(Object))

        component.toggleShowToolCalls({ checked: false })
        expect(component.showToolCalls()).toBe(false)
        expect(cookieService.put).toHaveBeenCalledWith('show_tool_calls', 'false', expect.any(Object))
    })
})
