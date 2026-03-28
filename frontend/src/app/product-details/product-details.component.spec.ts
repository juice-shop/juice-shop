/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { provideZoneChangeDetection } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ProductReviewEditComponent } from '../product-review-edit/product-review-edit.component'
import { By } from '@angular/platform-browser'
import { MatDividerModule } from '@angular/material/divider'
import { UserService } from '../Services/user.service'
import { ProductReviewService } from '../Services/product-review.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatBadgeModule } from '@angular/material/badge'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon'
import { MatExpansionModule } from '@angular/material/expansion'

import { ProductDetailsComponent } from './product-details.component'
import { of, throwError } from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { type Product } from '../Models/product.model'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ProductDetailsComponent', () => {
    let component: ProductDetailsComponent
    let fixture: ComponentFixture<ProductDetailsComponent>
    let userService: any
    let productReviewService: any
    let dialog: any
    let dialogRefMock

    beforeEach(async () => {
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI")
        }
        userService.whoAmI.mockReturnValue(of({}))
        productReviewService = {
            get: vi.fn().mockName("ProductReviewService.get"),
            create: vi.fn().mockName("ProductReviewService.create")
        }
        productReviewService.get.mockReturnValue(of([]))
        productReviewService.create.mockReturnValue(of({}))
        dialog = {
            open: vi.fn().mockName("Dialog.open")
        }
        dialogRefMock = {
            afterClosed: () => of({})
        }
        dialog.open.mockReturnValue(dialogRefMock)

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatDialogModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatDividerModule,
                MatBadgeModule,
                MatIconModule,
                MatTooltipModule,
                MatExpansionModule,
                MatSnackBarModule,
                ProductDetailsComponent],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: ProductReviewService, useValue: productReviewService },
                { provide: MatDialog, useValue: dialog },
                { provide: MAT_DIALOG_DATA, useValue: { productData: {} } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                provideZoneChangeDetection()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductDetailsComponent)
        component = fixture.componentInstance
        fixture.autoDetectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should post anonymous review if no user email is returned', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({}))
        component.ngOnInit()
        const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
        textArea.value = 'Great product!'
        const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
        buttonDe.triggerEventHandler('click', null)
        const reviewObject = { message: 'Great product!', author: 'Anonymous' }
        expect(vi.mocked(productReviewService.create).mock.calls.length).toBe(1)
        expect(vi.mocked(productReviewService.create).mock.calls[0][0]).toBe(42)
        expect(vi.mocked(productReviewService.create).mock.calls[0][1]).toEqual(reviewObject)
    })

    it('should post review with user email as author', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        component.ngOnInit()
        const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
        textArea.value = 'Great product!'
        const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
        buttonDe.triggerEventHandler('click', null)
        const reviewObject = { message: 'Great product!', author: 'horst@juice-sh.op' }
        expect(vi.mocked(productReviewService.create).mock.calls.length).toBe(1)
        expect(vi.mocked(productReviewService.create).mock.calls[0][0]).toBe(42)
        expect(vi.mocked(productReviewService.create).mock.calls[0][1]).toEqual(reviewObject)
    })

    it('should log errors when retrieving user directly to browser console', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log errors when posting review directly to browser console', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({}))
        productReviewService.create.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
        textArea.value = 'Great product!'
        const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
        buttonDe.triggerEventHandler('click', null)
        expect(console.log).toHaveBeenCalledWith('Error')
        fixture.destroy()
    })

    it('should refresh reviews after posting a review', () => {
        component.data = { productData: { id: 42 } as Product }
        productReviewService.create.mockReturnValue(of({}))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Review 1', author: 'Anonymous' }]))
        userService.whoAmI.mockReturnValue(of({}))
        component.ngOnInit()
        const textArea: HTMLTextAreaElement = fixture.debugElement.query(By.css('textarea')).nativeElement
        textArea.value = 'Great product!'
        const buttonDe = fixture.debugElement.query(By.css('#submitButton'))
        buttonDe.triggerEventHandler('click', null)
        expect(productReviewService.create).toHaveBeenCalled()
        expect(productReviewService.get).toHaveBeenCalled()
    })

    it('should open a modal dialog with review editor', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Great product!', author: 'horst@juice-sh.op' }]))
        component.ngOnInit()
        fixture.detectChanges()
        const buttonDe = fixture.debugElement.query(By.css('div.review-text'))
        buttonDe.triggerEventHandler('click', null)
        expect(vi.mocked(dialog.open).mock.calls.length).toBe(1)
        expect(vi.mocked(dialog.open).mock.calls[0][0]).toBe(ProductReviewEditComponent)
        expect(vi.mocked(dialog.open).mock.calls[0][1].data).toEqual({ reviewData: { id: '42', message: 'Great product!', author: 'horst@juice-sh.op' } })
    })

    it('should refresh reviews of product after editing a review', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Great product!', author: 'horst@juice-sh.op' }]))
        component.ngOnInit()
        fixture.detectChanges()
        const buttonDe = fixture.debugElement.query(By.css('div.review-text'))
        buttonDe.triggerEventHandler('click', null)
        expect(productReviewService.get).toHaveBeenCalledWith(42)
    })
})
