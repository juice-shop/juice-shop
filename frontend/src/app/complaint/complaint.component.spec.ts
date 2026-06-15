/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ComplaintService } from '../Services/complaint.service'
import { UserService } from '../Services/user.service'
import { ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FileItem, FileUploadModule } from 'ng2-file-upload'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ComplaintComponent } from './complaint.component'
import { of, throwError } from 'rxjs'

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ComplaintComponent', () => {
    let component: ComplaintComponent
    let fixture: ComponentFixture<ComplaintComponent>
    let userService: any
    let complaintService: any
    let translateService

    beforeEach(async () => {
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI")
        }
        userService.whoAmI.mockReturnValue(of({}))
        complaintService = {
            save: vi.fn().mockName("ComplaintService.save")
        }
        complaintService.save.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule,
                FileUploadModule,
                TranslateModule.forRoot(),
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                ComplaintComponent],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: ComplaintService, useValue: complaintService },
                { provide: TranslateService, useValue: translateService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

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

    it('should have a message of maximum 4096 characters', () => {
        component.messageControl.setValue('a'.repeat(4096 + 1))
        expect(component.messageControl.valid).toBeFalsy()
        component.messageControl.setValue("a")
        expect(component.messageControl.valid).toBe(true)
    })

    it('should reset form by calling resetForm', () => {
        component.messageControl.setValue('Message')
        component.resetForm()
        expect(component.messageControl.pristine).toBe(true)
        expect(component.messageControl.untouched).toBe(true)
        expect(component.messageControl.value).toBe('')
    })

    it('should miss complaint object if retrieving currently logged in user fails', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        userService.whoAmI.mockReturnValue(throwError('Error'))
        component.ngOnInit()
        expect(component.complaint).toBeUndefined()
    })

    it('should hold the user email of the currently logged in user', () => {
        userService.whoAmI.mockReturnValue(of({ email: 'x@x.xx' }))
        component.ngOnInit()
        expect(component.userEmail).toBe('x@x.xx')
    })

    it('should hold no email if current user is not logged in', () => {
        userService.whoAmI.mockReturnValue(of({}))
        component.ngOnInit()
        expect(component.userEmail).toBeUndefined()
        expect(component.customerControl.value).toBeUndefined()
    })

    it('should display support message with #id and reset complaint form on saving complaint', () => {
        complaintService.save.mockReturnValue(of({ id: 42 }))
        translateService.get.mockReturnValue(of('CUSTOMER_SUPPORT_COMPLAINT_REPLY'))
        component.uploader.queue[0] = null as unknown as FileItem
        component.save()
        expect(translateService.get).toHaveBeenCalledWith('CUSTOMER_SUPPORT_COMPLAINT_REPLY', { ref: 42 })
    })

    it('should begin uploading file if it has been added on saving', () => {
        component.uploader.queue[0] = new FileItem(component.uploader, new File([''], 'file.pdf', { type: 'application/pdf' }), { url: '' })
        vi.spyOn(component.uploader.queue[0], 'upload')
        component.save()
        expect(component.uploader.queue[0].upload).toHaveBeenCalled()
    })

    describe('file uploader callbacks', () => {
        it('should expose the upload error to the template when a file fails the upload filter', () => {
            expect(() => component.uploader.onWhenAddingFileFailed({} as any, { name: 'mimeType' } as any, undefined as any))
                .toThrow(/mimeType/)
            expect(component.fileUploadError).toEqual({ name: 'mimeType' })
        })

        it('should clear the upload error after a file is successfully added', () => {
            component.fileUploadError = { name: 'mimeType' } as any
            component.uploader.onAfterAddingFile({} as any)
            expect(component.fileUploadError).toBeUndefined()
        })

        it('should save the complaint and clear the upload queue once a file upload succeeds', () => {
            const saveSpy = vi.spyOn(component, 'saveComplaint').mockImplementation(() => { })
            const clearSpy = vi.spyOn(component.uploader, 'clearQueue')
            component.uploader.onSuccessItem({} as any, '', 200, {} as any)
            expect(saveSpy).toHaveBeenCalled()
            expect(clearSpy).toHaveBeenCalled()
        })
    })

    describe('saveComplaint translation fallback', () => {
        it('should use the translation id as confirmation when translation fails', () => {
            complaintService.save.mockReturnValue(of({ id: 99 }))
            translateService.get.mockReturnValue(throwError(() => 'CUSTOMER_SUPPORT_COMPLAINT_REPLY'))
            component.complaint = {}
            component.messageControl.setValue('a complaint message')
            component.saveComplaint()
            expect(component.confirmation).toBe('CUSTOMER_SUPPORT_COMPLAINT_REPLY')
        })
    })

    describe('template rendering', () => {
        it('should render the complaint heading, message textarea, file input and submit button', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')).toBeTruthy()
            expect(compiled.querySelector('textarea#complaintMessage')).toBeTruthy()
            expect(compiled.querySelector('input#file[type="file"]')).toBeTruthy()
            expect(compiled.querySelector('button#submitButton')).toBeTruthy()
        })

        it('should keep the submit button disabled while the message control is invalid', () => {
            const button = (fixture.nativeElement as HTMLElement).querySelector('button#submitButton') as HTMLButtonElement
            expect(button.disabled).toBe(true)
        })

        it('should render the confirmation message when confirmation is set and the message is pristine', () => {
            component.confirmation = 'Complaint received'
            fixture.detectChanges()
            const confirmation = (fixture.nativeElement as HTMLElement).querySelector('p.confirmation') as HTMLElement
            expect(confirmation).toBeTruthy()
            expect(confirmation.hidden).toBe(false)
            expect(confirmation.textContent).toContain('Complaint received')
        })

        it('should render the invalid file-type error when the mimeType upload error is set', () => {
            component.fileUploadError = { name: 'mimeType' } as any
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('p.fileUploadError')).toBeTruthy()
        })
    })
})
