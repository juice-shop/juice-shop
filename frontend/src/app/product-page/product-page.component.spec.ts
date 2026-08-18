/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideZoneChangeDetection } from '@angular/core'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialog } from '@angular/material/dialog'
import { of } from 'rxjs'

import { ProductPageComponent } from './product-page.component'
import { ProductService } from '../Services/product.service'
import { ProductReviewService } from '../Services/product-review.service'
import { UserService } from '../Services/user.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { DeluxeGuard } from '../app.guard'

describe('ProductPageComponent', () => {
    let component: ProductPageComponent
    let fixture: ComponentFixture<ProductPageComponent>
    let productService: any
    let productReviewService: any
    let userService: any
    let snackBarHelper: any
    let dialog: any
    let deluxeGuard: any
    let router: any
    let location: any

    const testProduct = {
        id: 12,
        name: 'Apple Juice',
        description: '<p>Fresh apples</p>',
        image: 'apple_juice.jpg',
        price: 19.9,
        deluxePrice: 19.9
    }

    beforeEach(async () => {
        productService = {
            get: vi.fn().mockName('ProductService.get'),
            search: vi.fn().mockName('ProductService.search')
        }
        productService.get.mockReturnValue(of(testProduct))
        productService.search.mockReturnValue(of([]))

        productReviewService = {
            get: vi.fn().mockName('ProductReviewService.get'),
            create: vi.fn().mockName('ProductReviewService.create'),
            like: vi.fn().mockName('ProductReviewService.like')
        }
        productReviewService.get.mockReturnValue(of([]))
        productReviewService.create.mockReturnValue(of({}))
        productReviewService.like.mockReturnValue(of({}))

        userService = {
            whoAmI: vi.fn().mockName('UserService.whoAmI')
        }
        userService.whoAmI.mockReturnValue(of({ email: 'user@example.com' }))

        snackBarHelper = {
            open: vi.fn().mockName('SnackBarHelperService.open')
        }
        dialog = {
            open: vi.fn().mockName('MatDialog.open')
        }
        dialog.open.mockReturnValue({ afterClosed: () => of(undefined) })
        deluxeGuard = {
            isDeluxe: vi.fn().mockName('DeluxeGuard.isDeluxe')
        }
        deluxeGuard.isDeluxe.mockReturnValue(false)
        router = {
            navigate: vi.fn().mockName('Router.navigate')
        }
        location = {
            back: vi.fn().mockName('Location.back')
        }

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ProductPageComponent],
            providers: [
                provideZoneChangeDetection(),
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '12' })), queryParamMap: of(convertToParamMap({ q: 'apple' })) } },
                { provide: Router, useValue: router },
                { provide: Location, useValue: location },
                { provide: ProductService, useValue: productService },
                { provide: ProductReviewService, useValue: productReviewService },
                { provide: UserService, useValue: userService },
                { provide: SnackBarHelperService, useValue: snackBarHelper },
                { provide: MatDialog, useValue: dialog },
                { provide: DeluxeGuard, useValue: deluxeGuard }
            ]
        })
            .compileComponents()

        fixture = TestBed.createComponent(ProductPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should report logged-in state from the stored token', () => {
        localStorage.removeItem('token')
        expect(component.isLoggedIn()).toBe(false)
        localStorage.setItem('token', 'token')
        expect(component.isLoggedIn()).toBe(true)
        localStorage.removeItem('token')
    })

    it('should delegate deluxe state to DeluxeGuard', () => {
        deluxeGuard.isDeluxe.mockReturnValue(true)
        expect(component.isDeluxe()).toBe(true)
        expect(deluxeGuard.isDeluxe).toHaveBeenCalled()
    })

    it('should go back using browser history when available', () => {
        Object.defineProperty(window.history, 'length', { configurable: true, get: () => 3 })
        component.goBack()
        expect(location.back).toHaveBeenCalled()
    })

    it('should fall back to search when there is no history', () => {
        Object.defineProperty(window.history, 'length', { configurable: true, get: () => 1 })
        component.goBack()
        expect(router.navigate).toHaveBeenCalledWith(['/search'])
    })

    it('should add a review for the current product', () => {
        const textPut = { value: 'Great juice' } as HTMLTextAreaElement
        component.addReview(textPut)
        expect(productReviewService.create).toHaveBeenCalledWith(12, { message: 'Great juice', author: 'user@example.com' })
        expect(snackBarHelper.open).toHaveBeenCalledWith('CONFIRM_REVIEW_SAVED')
    })

    it('should like a review', () => {
        vi.useFakeTimers()
        component.likeReview({ _id: 'abc', message: 'Nice', author: 'someone' })
        expect(productReviewService.like).toHaveBeenCalledWith('abc')
        vi.advanceTimersByTime(200)
        vi.useRealTimers()
    })

    it('should open the edit review dialog', () => {
        component.editReview({ _id: 'abc', message: 'Nice', author: 'someone' })
        expect(dialog.open).toHaveBeenCalled()
    })
})
