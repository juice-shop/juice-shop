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
            create: vi.fn().mockName("ProductReviewService.create"),
            like: vi.fn().mockName("ProductReviewService.like")
        }
        productReviewService.get.mockReturnValue(of([]))
        productReviewService.create.mockReturnValue(of({}))
        productReviewService.like.mockReturnValue(of({}))
        dialog = {
            open: vi.fn().mockName("Dialog.open")
        }
        dialogRefMock = {
            afterClosed: () => of({})
        }
        dialog.open.mockReturnValue(dialogRefMock)

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
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
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should post anonymous review if no user email is returned', async () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({}))
        fixture.detectChanges()
        component.reviewModel.update((model) => ({ ...model, message: 'Great product!' }))
        await component.addReview()
        const reviewObject = { message: 'Great product!', author: 'Anonymous' }
        expect(vi.mocked(productReviewService.create).mock.calls.length).toBe(1)
        expect(vi.mocked(productReviewService.create).mock.calls[0][0]).toBe(42)
        expect(vi.mocked(productReviewService.create).mock.calls[0][1]).toEqual(reviewObject)
    })

    it('should post review with user email as author', async () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        fixture.detectChanges()
        component.reviewModel.update((model) => ({ ...model, message: 'Great product!' }))
        await component.addReview()
        const reviewObject = { message: 'Great product!', author: 'horst@juice-sh.op' }
        expect(vi.mocked(productReviewService.create).mock.calls.length).toBe(1)
        expect(vi.mocked(productReviewService.create).mock.calls[0][0]).toBe(42)
        expect(vi.mocked(productReviewService.create).mock.calls[0][1]).toEqual(reviewObject)
    })

    it('should log errors when retrieving user directly to browser console', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log errors when posting review directly to browser console', async () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({}))
        productReviewService.create.mockReturnValue(throwError(() => 'Error'))
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        fixture.detectChanges()
        component.reviewModel.update((model) => ({ ...model, message: 'Great product!' }))
        await component.addReview()
        expect(log).toHaveBeenCalledWith('Error')
        expect(component.reviewModel().message).toBe('Great product!')
        log.mockRestore()
        fixture.destroy()
    })

    it('should refresh reviews after posting a review', async () => {
        component.data = { productData: { id: 42 } as Product }
        productReviewService.create.mockReturnValue(of({}))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Review 1', author: 'Anonymous' }]))
        userService.whoAmI.mockReturnValue(of({}))
        fixture.detectChanges()
        component.reviewModel.update((model) => ({ ...model, message: 'Great product!' }))
        await component.addReview()
        expect(productReviewService.create).toHaveBeenCalled()
        expect(productReviewService.get).toHaveBeenCalled()
        expect(component.reviewModel().message).toBe('')
    })

    it('should update the liked review locally without refetching the list', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        productReviewService.get.mockReturnValue(of([
            { _id: '1', message: 'Great product!', author: 'jim@juice-sh.op', liked: false, likesCount: 2 }
        ]))
        fixture.detectChanges()

        component.likeReview(component.reviews()[0])

        expect(productReviewService.like).toHaveBeenCalledWith('1')
        expect(component.reviews()[0].liked).toBe(true)
        expect(component.reviews()[0].likesCount).toBe(3)
        expect(component.likedReviewId()).toBe('1')
        expect(productReviewService.get).toHaveBeenCalledTimes(1)
    })

    it('should open a modal dialog with review editor', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Great product!', author: 'horst@juice-sh.op' }]))
        fixture.detectChanges()
        const buttonDe = fixture.debugElement.query(By.css('button.edit-review-button'))
        buttonDe.triggerEventHandler('click', null)
        expect(vi.mocked(dialog.open).mock.calls.length).toBe(1)
        expect(vi.mocked(dialog.open).mock.calls[0][0]).toBe(ProductReviewEditComponent)
        expect(vi.mocked(dialog.open).mock.calls[0][1].data).toEqual({ reviewData: { id: '42', message: 'Great product!', author: 'horst@juice-sh.op' } })
    })

    it('should refresh reviews of product after editing a review', () => {
        component.data = { productData: { id: 42 } as Product }
        userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
        productReviewService.get.mockReturnValue(of([{ id: '42', message: 'Great product!', author: 'horst@juice-sh.op' }]))
        fixture.detectChanges()
        const buttonDe = fixture.debugElement.query(By.css('button.edit-review-button'))
        buttonDe.triggerEventHandler('click', null)
        expect(productReviewService.get).toHaveBeenCalledWith(42)
    })

    describe('template rendering', () => {
        it('should render the product name and price from the dialog data', () => {
            component.data = { productData: { id: 1, name: 'Apple Juice', description: 'Tasty', price: 1.99, image: 'apple.jpg' } as Product }
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')?.textContent).toContain('Apple Juice')
            expect(compiled.querySelector('.item-price')?.textContent).toContain('1.99')
        })

        it('should render the bonus-points badge only when productData.points is greater than zero', () => {
            component.data = { productData: { id: 1, name: 'A', description: '', price: 1, image: '', points: 0 } as any }
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('.warn-notification')).toBeNull()

            component.data = { productData: { id: 1, name: 'A', description: '', price: 1, image: '', points: 7 } as any }
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('.warn-notification')?.textContent).toContain('7')
        })

        it('should render the close dialog button and the review textarea', () => {
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('button.close-dialog')).toBeTruthy()
            expect(compiled.querySelector('textarea')).toBeTruthy()
        })

        it('should keep the submit review button disabled while the textarea is empty', () => {
            fixture.detectChanges()
            const button = (fixture.nativeElement as HTMLElement).querySelector('button#submitButton') as HTMLButtonElement
            expect(button.disabled).toBe(true)
        })

        it('should render the empty review placeholder when there are no reviews', () => {
            component.data = { productData: { id: 42 } as Product }
            productReviewService.get.mockReturnValue(of([]))
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('.noResultText')).toBeTruthy()
        })

        it('should only show the edit button on reviews authored by the current user', () => {
            component.data = { productData: { id: 42 } as Product }
            userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
            productReviewService.get.mockReturnValue(of([
                { _id: '1', message: 'Mine', author: 'horst@juice-sh.op', liked: false, likesCount: 0 },
                { _id: '2', message: 'Someone else', author: 'jim@juice-sh.op', liked: false, likesCount: 0 },
                { _id: '3', message: 'Anonymous review', author: 'Anonymous', liked: false, likesCount: 0 }
            ]))
            fixture.detectChanges()
            const editButtons = (fixture.nativeElement as HTMLElement).querySelectorAll('button.edit-review-button')
            expect(editButtons.length).toBe(1)
        })

        it('should disable the like button for reviews that are already liked', () => {
            vi.spyOn(component, 'isLoggedIn').mockReturnValue('token')
            component.data = { productData: { id: 42 } as Product }
            userService.whoAmI.mockReturnValue(of({ email: 'horst@juice-sh.op' }))
            productReviewService.get.mockReturnValue(of([
                { _id: '1', message: 'Liked', author: 'jim@juice-sh.op', liked: true, likesCount: 3 },
                { _id: '2', message: 'Not liked', author: 'jim@juice-sh.op', liked: false, likesCount: 0 }
            ]))
            fixture.detectChanges()
            const likeButtons = (fixture.nativeElement as HTMLElement).querySelectorAll('button.rw-button')
            expect((likeButtons[0] as HTMLButtonElement).disabled).toBe(true)
            expect((likeButtons[1] as HTMLButtonElement).disabled).toBe(false)
        })
    })
})
