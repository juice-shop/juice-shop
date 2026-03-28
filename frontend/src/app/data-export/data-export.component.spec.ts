/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { DataExportComponent } from './data-export.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ImageCaptchaService } from '../Services/image-captcha.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { SecurityContext } from '@angular/core'
import { DataSubjectService } from '../Services/data-subject.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { MatRadioModule } from '@angular/material/radio'
import { MatButtonModule } from '@angular/material/button'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('DataExportComponent', () => {
    let component: DataExportComponent
    let fixture: ComponentFixture<DataExportComponent>
    let imageCaptchaService: any
    let dataSubjectService: any
    let domSanitizer: DomSanitizer

    beforeEach(async () => {
        imageCaptchaService = {
            getCaptcha: vi.fn().mockName("ImageCaptchaService.getCaptcha")
        }
        imageCaptchaService.getCaptcha.mockReturnValue(of({}))
        dataSubjectService = {
            dataExport: vi.fn().mockName("DataSubjectService.dataExport")
        }

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                MatFormFieldModule,
                ReactiveFormsModule,
                MatInputModule,
                MatCardModule,
                MatRadioModule,
                MatButtonModule,
                DataExportComponent],
            providers: [
                { provide: ImageCaptchaService, useValue: imageCaptchaService },
                { provide: DataSubjectService, useValue: dataSubjectService },
                TranslateService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(DataExportComponent)
        component = fixture.componentInstance
        domSanitizer = TestBed.inject(DomSanitizer)
        fixture.detectChanges()
    })

    it('should compile', () => {
        expect(component).toBeTruthy()
    })

    it('should reinitizalise form by calling resetForm', () => {
        component.captchaControl.setValue('captcha')
        component.formatControl.setValue('1')
        component.resetForm()
        expect(component.captchaControl.value).toBe('')
        expect(component.captchaControl.pristine).toBe(true)
        expect(component.captchaControl.untouched).toBe(true)
        expect(component.formatControl.value).toBe('')
        expect(component.formatControl.pristine).toBe(true)
        expect(component.formatControl.untouched).toBe(true)
    })

    it('should be compulsory to select export format', () => {
        component.formatControl.setValue('')
        expect(component.formatControl.valid).toBeFalsy()
    })

    it('should be compulsory to answer the captcha when captcha is present', () => {
        component.captchaControl.setValue('')
        expect(component.captchaControl.valid).toBeFalsy()
        component.captchaControl.setValue('12345')
        expect(component.captchaControl.valid).toBe(true)
    })

    it('should store the captcha on getting new captcha', () => {
        imageCaptchaService.getCaptcha.mockReturnValue(of({ image: '<svg>captcha</svg>' }))
        component.getNewCaptcha()
        const sanitezedCaptcha = domSanitizer.sanitize(SecurityContext.HTML, component.captcha)
        expect(sanitezedCaptcha).toBe('<svg>captcha</svg>')
    })

    it('should show the confirmation and fetch user data and reset data export form on requesting data export', () => {
        dataSubjectService.dataExport.mockReturnValue(of({ confirmation: 'Data being exported', userData: '{ user data }' }))
        vi.spyOn(component, 'resetForm')
        vi.spyOn(component, 'ngOnInit')
        component.save()
        expect(component.confirmation).toBe('Data being exported')
        expect(component.userData).toBe('{ user data }')
        expect(component.error).toBeNull()
        expect(component.ngOnInit).toHaveBeenCalled()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should clear the form and display error if exporting data fails', () => {
        dataSubjectService.dataExport.mockReturnValue(throwError({ error: 'Error' }))
        vi.spyOn(component, 'resetFormError')
        component.save()
        expect(component.confirmation).toBeNull()
        expect(component.error).toBe('Error')
        expect(component.resetFormError).toHaveBeenCalled()
    })
})
