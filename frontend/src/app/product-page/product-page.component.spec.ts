/*!
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideZoneChangeDetection } from '@angular/core'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDialog } from '@angular/material/dialog'
import { of, Subject } from 'rxjs'

import { ProductPageComponent } from './product-page.component'
import { ProductService } from '../Services/product.service'
import { BasketService } from '../Services/basket.service'
import { ProductReviewService } from '../Services/product-review.service'
import { UserService } from '../Services/user.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { DeluxeGuard } from '../app.guard'

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        observe () {}
        unobserve () {}
        disconnect () {}
    } as any
}

describe('ProductPageComponent', () => {
    let component: ProductPageComponent
    let fixture: ComponentFixture<ProductPageComponent>
    let productService: any
    let basketService: any
    let productReviewService: any
    let userService: any
    let snackBarHelper: any
    let dialog: any
    let deluxeGuard: any
    let router: any
    let location: any
    let activatedRoute: any

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

        basketService = {
            find: vi.fn().mockName('BasketService.find'),
            get: vi.fn().mockName('BasketService.get'),
            put: vi.fn().mockName('BasketService.put'),
            save: vi.fn().mockName('BasketService.save'),
            addToGuestBasket: vi.fn().mockName('BasketService.addToGuestBasket'),
            updateNumberOfCartItems: vi.fn().mockName('BasketService.updateNumberOfCartItems')
        }
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 }))
        basketService.put.mockReturnValue(of({ ProductId: 12 }))
        basketService.save.mockReturnValue(of({ ProductId: 12 }))

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

        activatedRoute = {
            paramMap: of(convertToParamMap({ id: '12' })),
            queryParamMap: of(convertToParamMap({ q: 'apple' }))
        }

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ProductPageComponent],
            providers: [
                provideZoneChangeDetection(),
                { provide: ActivatedRoute, useValue: activatedRoute },
                { provide: Router, useValue: router },
                { provide: Location, useValue: location },
                { provide: ProductService, useValue: productService },
                { provide: BasketService, useValue: basketService },
                { provide: ProductReviewService, useValue: productReviewService },
                { provide: UserService, useValue: userService },
                { provide: SnackBarHelperService, useValue: snackBarHelper },
                { provide: MatDialog, useValue: dialog },
                { provide: DeluxeGuard, useValue: deluxeGuard }
            ]
        })
            .compileComponents()

        const translateService = TestBed.inject(TranslateService)
        vi.spyOn(translateService, 'get').mockReturnValue(of('ok'))

        fixture = TestBed.createComponent(ProductPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should keep the reviews panel closed by default', () => {
        expect(component.reviewsExpanded()).toBe(false)
    })

    it('should open the reviews panel when the goto-reviews query param is true', async () => {
        activatedRoute.queryParamMap = of(convertToParamMap({ 'goto-reviews': 'true' }))
        const reviewsFixture = TestBed.createComponent(ProductPageComponent)
        const reviewsComponent = reviewsFixture.componentInstance
        reviewsFixture.detectChanges()
        await vi.waitFor(() => expect(reviewsComponent.reviewsExpanded()).toBe(true))
    })

    it('should scroll to the reviews section when the goto-reviews query param is true', async () => {
        activatedRoute.queryParamMap = of(convertToParamMap({ 'goto-reviews': 'true' }))
        const scrollFixture = TestBed.createComponent(ProductPageComponent)
        const scrollComponent = scrollFixture.componentInstance
        const scrollSpy = vi.spyOn(scrollComponent as any, 'scrollToReviewsSection').mockImplementation(() => {})
        scrollFixture.detectChanges()
        await vi.waitFor(() => {
            scrollFixture.detectChanges()
            expect(scrollSpy).toHaveBeenCalled()
        })
    })

    it('should add the product to the guest basket when logged out', () => {
        localStorage.removeItem('token')
        component.addToBasket()
        expect(basketService.addToGuestBasket).toHaveBeenCalledWith(12, 1)
        expect(productService.get).toHaveBeenCalledWith(12)
    })

    it('should save a new basket item when logged in', () => {
        localStorage.setItem('token', 'token')
        sessionStorage.setItem('bid', '4711')
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.save.mockReturnValue(of({ ProductId: 12 }))
        component.addToBasket()
        expect(basketService.find).toHaveBeenCalledWith(4711)
        expect(basketService.save).toHaveBeenCalledWith({ ProductId: 12, BasketId: '4711', quantity: 1 })
    })

    it('should increment and decrement the quantity, never below one', () => {
        component.incrementQuantity()
        component.incrementQuantity()
        expect(component.quantity()).toBe(3)
        component.decrementQuantity()
        expect(component.quantity()).toBe(2)
        component.decrementQuantity()
        component.decrementQuantity()
        expect(component.quantity()).toBe(1)
    })

    it('should add the selected quantity to the guest basket', () => {
        localStorage.removeItem('token')
        component.quantity.set(3)
        component.addToBasket()
        expect(basketService.addToGuestBasket).toHaveBeenCalledWith(12, 3)
    })

    it('should save the selected quantity for a new basket item when logged in', () => {
        localStorage.setItem('token', 'token')
        sessionStorage.setItem('bid', '4711')
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.save.mockReturnValue(of({ ProductId: 12 }))
        component.quantity.set(3)
        component.addToBasket()
        expect(basketService.save).toHaveBeenCalledWith({ ProductId: 12, BasketId: '4711', quantity: 3 })
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

    it('should show the normal price for non-deluxe users', async () => {
        deluxeGuard.isDeluxe.mockReturnValue(false)
        productService.get.mockReturnValue(of({ ...testProduct, deluxePrice: 9.99 }))
        const priceFixture = TestBed.createComponent(ProductPageComponent)
        priceFixture.detectChanges()
        await vi.waitFor(() => {
            priceFixture.detectChanges()
            const price = priceFixture.nativeElement.querySelector('.item-price')
            expect(price).toBeTruthy()
            expect(price.textContent).toContain('19.9')
            expect(price.querySelector('.expired')).toBeNull()
        })
    })

    it('should show the deluxe price struck through for deluxe users', async () => {
        deluxeGuard.isDeluxe.mockReturnValue(true)
        productService.get.mockReturnValue(of({ ...testProduct, deluxePrice: 9.99 }))
        const priceFixture = TestBed.createComponent(ProductPageComponent)
        priceFixture.detectChanges()
        await vi.waitFor(() => {
            priceFixture.detectChanges()
            const price = priceFixture.nativeElement.querySelector('.item-price')
            expect(price).toBeTruthy()
            expect(price.querySelector('.expired')?.textContent).toContain('19.9')
            expect(price.textContent).toContain('9.99')
        })
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

    it('should load related products excluding the current product', async () => {
        productService.search.mockReturnValue(of([
            { id: 12, name: 'Current' },
            ...Array.from({ length: 10 }, (_, index) => ({ id: index + 1, name: `Product ${index + 1}` }))
        ]))
        const relatedFixture = TestBed.createComponent(ProductPageComponent)
        const relatedComponent = relatedFixture.componentInstance
        relatedFixture.detectChanges()
        await vi.waitFor(() => {
            const related = relatedComponent.relatedProductsResource.value() as any[]
            expect(related).toHaveLength(10)
            expect(related.some((product) => product.id === 12)).toBe(false)
        })
        expect(productService.search).toHaveBeenCalledWith('apple')
    })

    it('should display one row of related products based on the grid columns', () => {
        component.columnCount.set(1)
        expect(component.relatedDisplayCount()).toBe(1)
        component.columnCount.set(3)
        expect(component.relatedDisplayCount()).toBe(3)
        component.columnCount.set(4)
        expect(component.relatedDisplayCount()).toBe(4)
        component.columnCount.set(6)
        expect(component.relatedDisplayCount()).toBe(6)
    })

    it('should show a spinner while the product is loading', async () => {
        const pending = new Subject<any>()
        productService.get.mockReturnValue(pending)
        const loadingFixture = TestBed.createComponent(ProductPageComponent)
        loadingFixture.detectChanges()
        expect(loadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading"]')).toBeTruthy()
        expect(loadingFixture.nativeElement.querySelector('.details')).toBeNull()

        pending.next(testProduct)
        pending.complete()
        await vi.waitFor(() => {
            loadingFixture.detectChanges()
            expect(loadingFixture.nativeElement.querySelector('.details')).toBeTruthy()
            expect(loadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading"]')).toBeNull()
        })
    })

    it('should show a spinner while reviews are loading', async () => {
        const pending = new Subject<any[]>()
        productReviewService.get.mockReturnValue(pending)
        const reviewsLoadingFixture = TestBed.createComponent(ProductPageComponent)
        reviewsLoadingFixture.detectChanges()
        await vi.waitFor(() => {
            reviewsLoadingFixture.detectChanges()
            expect(reviewsLoadingFixture.nativeElement.querySelector('.details')).toBeTruthy()
        })
        expect(reviewsLoadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading reviews"]')).toBeTruthy()
        expect(reviewsLoadingFixture.nativeElement.querySelector('.review-item')).toBeNull()

        pending.next([])
        pending.complete()
        await vi.waitFor(() => {
            reviewsLoadingFixture.detectChanges()
            expect(reviewsLoadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading reviews"]')).toBeNull()
        })
    })

    it('should show a spinner while related products are loading', async () => {
        const pending = new Subject<any[]>()
        productService.search.mockReturnValue(pending)
        const relatedLoadingFixture = TestBed.createComponent(ProductPageComponent)
        relatedLoadingFixture.detectChanges()
        await vi.waitFor(() => {
            relatedLoadingFixture.detectChanges()
            expect(relatedLoadingFixture.nativeElement.querySelector('.details')).toBeTruthy()
        })
        expect(relatedLoadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading related products"]')).toBeTruthy()
        expect(relatedLoadingFixture.nativeElement.querySelector('.products-grid')).toBeNull()

        pending.next([])
        pending.complete()
        await vi.waitFor(() => {
            relatedLoadingFixture.detectChanges()
            expect(relatedLoadingFixture.nativeElement.querySelector('mat-spinner[aria-label="Loading related products"]')).toBeNull()
        })
    })
})
