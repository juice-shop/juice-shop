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
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { twitterUrl: 'https://twitter.com/twitter' } } }))
        component.ngOnInit()
        expect(component.twitterHandle).toBe('@twitter')
    })

    it('should use custom blueSky handle if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { blueSkyUrl: 'https://bsky.app/profile/owasp' } } }))
        component.ngOnInit()
        expect(component.blueSkyHandle).toBe('@owasp')
    })

    it('should use custom mastodon handle if configured', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { social: { mastodonUrl: 'https://mastodon.social/@owasp' } } }))
        component.ngOnInit()
        expect(component.mastodonHandle).toBe('@owasp@mastodon.social')
    })

    it('should log error while getting application configuration from backend API directly to browser console', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should append uploader username to the caption when memory has a user', () => {
        photoWallService.get.mockReturnValue(of([{ imagePath: 'a.png', caption: 'Hi', User: { username: 'alice' } }]))
        component.ngOnInit()
        expect(component.slideshowDataSource[0].caption).toBe('Hi (© alice)')
    })

    it('should strip trailing slash from blueSky and mastodon URLs', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({
            application: { social: { blueSkyUrl: 'https://bsky.app/profile/owasp/', mastodonUrl: 'https://mastodon.social/@owasp/' } }
        }))
        component.ngOnInit()
        expect(component.blueSkyHandle).toBe('@owasp')
        expect(component.mastodonHandle).toBe('@owasp@mastodon.social')
    })

    it('should not set any social handle when config has no social settings', () => {
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
        component.ngOnInit()
        expect(component.twitterHandle).toBeNull()
        expect(component.blueSkyHandle).toBeNull()
        expect(component.mastodonHandle).toBeNull()
    })

    it('should patch the form and update the image preview when an image is picked', () => {
        const file = new File(['x'], 'pic.png', { type: 'image/png' })
        const event = { target: { files: [file] } } as unknown as Event
        const lastReader: any = {}
        const originalFileReader = window.FileReader
        class FakeFileReader {
            public onload: any = null
            public result: any = null
            public addEventListener = vi.fn()
            public removeEventListener = vi.fn()
            public readAsDataURL = vi.fn(() => {
                this.result = 'data:image/png;base64,abc'
                if (typeof this.onload === 'function') this.onload()
            })
            public readAsArrayBuffer = vi.fn()
            constructor () { Object.assign(lastReader, this) }
        }
        ;(window as any).FileReader = FakeFileReader as any

        component.onImagePicked(event)

        expect(component.form.get('image').value).toBe(file)
        expect(component.imagePreview).toBe('data:image/png;base64,abc')
        ;(window as any).FileReader = originalFileReader
    })

    it('should report logged in based on the presence of a token', () => {
        localStorage.removeItem('token')
        expect(component.isLoggedIn()).toBeNull()
        localStorage.setItem('token', 'abc')
        expect(component.isLoggedIn()).toBe('abc')
        localStorage.removeItem('token')
    })

    describe('template rendering', () => {
        it('should render the empty-state card when no memories are loaded', () => {
            photoWallService.get.mockReturnValue(of([]))
            component.ngOnInit()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.emptyState')).toBeTruthy()
            expect(compiled.querySelector('.grid')).toBeNull()
        })

        it('should render the grid with one tile per memory when memories exist', () => {
            photoWallService.get.mockReturnValue(of([
                { imagePath: 'a.png', caption: 'A' },
                { imagePath: 'b.png', caption: 'B' }
            ]))
            component.ngOnInit()
            fixture.detectChanges()
            const tiles = (fixture.nativeElement as HTMLElement).querySelectorAll('.grid .container')
            expect(tiles.length).toBe(2)
            expect((fixture.nativeElement as HTMLElement).querySelector('.emptyState')).toBeNull()
        })

        it('should render social share buttons only when matching handles are configured', () => {
            photoWallService.get.mockReturnValue(of([{ imagePath: 'a.png', caption: 'A' }]))
            configurationService.getApplicationConfiguration.mockReturnValue(of({
                application: { social: { twitterUrl: 'https://twitter.com/juice', blueSkyUrl: 'https://bsky.app/profile/juice', mastodonUrl: 'https://mastodon.social/@juice' } }
            }))
            component.ngOnInit()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('button[aria-label="Tweet"]')).toBeTruthy()
            expect(compiled.querySelector('button[aria-label="BlueSky"]')).toBeTruthy()
            expect(compiled.querySelector('button[aria-label="Mastodon"]')).toBeTruthy()
        })

        it('should not render social share buttons when no social handles are configured', () => {
            photoWallService.get.mockReturnValue(of([{ imagePath: 'a.png', caption: 'A' }]))
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} }))
            component.ngOnInit()
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('button[aria-label="Tweet"]')).toBeNull()
            expect(compiled.querySelector('button[aria-label="BlueSky"]')).toBeNull()
            expect(compiled.querySelector('button[aria-label="Mastodon"]')).toBeNull()
        })

        it('should render the share-a-memory form only when a token is stored', () => {
            localStorage.removeItem('token')
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('.share-memory-section')).toBeNull()

            localStorage.setItem('token', 'token')
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('.share-memory-section')).toBeTruthy()
            expect((fixture.nativeElement as HTMLElement).querySelector('#submitButton')).toBeTruthy()
            localStorage.removeItem('token')
        })

        it('should keep the submit button disabled while the form is invalid', () => {
            localStorage.setItem('token', 'token')
            fixture.detectChanges()
            const submit = (fixture.nativeElement as HTMLElement).querySelector('#submitButton') as HTMLButtonElement
            expect(submit.disabled).toBe(true)
            localStorage.removeItem('token')
        })

        it('should render the image preview once one is set and the image control is valid', () => {
            localStorage.setItem('token', 'token')
            component.imagePreview = 'data:image/png;base64,abc'
            component.form.get('image').setValue('file')
            component.form.get('image').setErrors(null)
            fixture.detectChanges()
            const preview = (fixture.nativeElement as HTMLElement).querySelector('.image-preview img') as HTMLImageElement
            expect(preview).toBeTruthy()
            expect(preview.getAttribute('src')).toBe('data:image/png;base64,abc')
            localStorage.removeItem('token')
        })
    })
})
