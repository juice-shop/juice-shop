/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { PhotoWallComponent } from './photo-wall.component'
import { PhotoWallService } from '../Services/photo-wall.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ConfigurationService } from '../Services/configuration.service'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PhotoWallComponent', () => {
    let component: PhotoWallComponent
    let fixture: ComponentFixture<PhotoWallComponent>
    let photoWallService: any
    let configurationService: any
    let snackBar: any
    let translateService

    beforeEach(async () => {
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({}))
        photoWallService = {
            get: vi.fn().mockName("PhotoWallService.get"),
            addMemory: vi.fn().mockName("PhotoWallService.addMemory")
        }
        photoWallService.get.mockReturnValue(of([]))
        photoWallService.addMemory.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule,
                TranslateModule.forRoot(),
                MatTableModule,
                MatPaginatorModule,
                MatFormFieldModule,
                MatDividerModule,
                MatGridListModule,
                MatCardModule,
                MatIconModule,
                MatTooltipModule,
                MatDialogModule,
                MatExpansionModule,
                FormsModule,
                ReactiveFormsModule,
                MatInputModule,
                PhotoWallComponent],
            providers: [
                { provide: PhotoWallService, useValue: photoWallService },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(PhotoWallComponent)
        component = fixture.componentInstance
        component.ngOnInit()
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should make emptyState true and hold no memories when get API gives empty response', () => {
        photoWallService.get.mockReturnValue(of([]))
        component.ngOnInit()
        expect(component.emptyState).toBe(true)
        expect(component.slideshowDataSource).toEqual([])
    })

    it('should make emptyState false when get API gives non empty response', () => {
        photoWallService.get.mockReturnValue(of([{ imagePath: '', caption: '' }]))
        component.ngOnInit()
        expect(component.emptyState).toBe(false)
    })

    it('should log error from get API call directly to browser console', () => {
        photoWallService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error from addMemory API call directly to browser console', () => {
        photoWallService.addMemory.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.save()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should add new memory to photo wall', () => {
        photoWallService.addMemory.mockReturnValue(of({}))
        vi.spyOn(component, 'ngOnInit')
        vi.spyOn(component, 'resetForm')
        component.save()
        expect(component.ngOnInit).toHaveBeenCalled()
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should reinitizalise add memory form by calling resetForm', () => {
        component.form.get('image').setValue(new File([''], 'image'))
        component.form.get('caption').setValue('Juice Party')
        component.resetForm()
        expect(component.form.get('image').value).toBe('')
        expect(component.form.get('image').pristine).toBe(true)
        expect(component.form.get('image').untouched).toBe(true)
        expect(component.form.get('caption').value).toBe('')
        expect(component.form.get('caption').pristine).toBe(true)
        expect(component.form.get('caption').untouched).toBe(true)
    })

    it('should use custom twitter handle if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { twitterUrl: 'twitter' } } }))
        component.ngOnInit()
        expect(component.twitterHandle).toBe('twitter')
    })

    it('should log error while getting application configuration from backend API directly to browser console', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })
})
