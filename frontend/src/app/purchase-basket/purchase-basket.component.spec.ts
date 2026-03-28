/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { BasketService } from '../Services/basket.service'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { UserService } from '../Services/user.service'
import { ProductService } from '../Services/product.service'
import { DeluxeGuard } from '../app.guard'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('PurchaseBasketComponent', () => {
    let component: PurchaseBasketComponent
    let fixture: ComponentFixture<PurchaseBasketComponent>
    let basketService
    let userService
    let productService
    let translateService: any
    let deluxeGuard
    let snackBar: any

    beforeEach(async () => {
        basketService = {
            find: vi.fn().mockName("BasketService.find"),
            del: vi.fn().mockName("BasketService.del"),
            get: vi.fn().mockName("BasketService.get"),
            put: vi.fn().mockName("BasketService.put"),
            updateNumberOfCartItems: vi.fn().mockName("BasketService.updateNumberOfCartItems"),
            getGuestBasketItems: vi.fn().mockName("BasketService.getGuestBasketItems"),
            removeGuestBasketItem: vi.fn().mockName("BasketService.removeGuestBasketItem"),
            updateGuestBasketItemQuantity: vi.fn().mockName("BasketService.updateGuestBasketItemQuantity")
        }
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.del.mockReturnValue(of({}))
        basketService.get.mockReturnValue(of({}))
        basketService.put.mockReturnValue(of({}))
        basketService.updateNumberOfCartItems.mockReturnValue(of({}))
        basketService.getGuestBasketItems.mockReturnValue([])
        basketService.removeGuestBasketItem.mockImplementation(() => {
        })
        basketService.updateGuestBasketItemQuantity.mockImplementation(() => {
        })
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI")
        }
        userService.whoAmI.mockReturnValue(of({}))
        productService = {
            get: vi.fn().mockName("ProductService.get")
        }
        productService.get.mockReturnValue(of({ id: 1, name: 'Product', price: 1, deluxePrice: 1 }))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        deluxeGuard = {
            isDeluxe: vi.fn()
        }
        deluxeGuard.isDeluxe.mockReturnValue(false)
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatInputModule,
                MatCardModule,
                MatTableModule,
                MatButtonModule,
                MatButtonToggleModule,
                MatSnackBarModule,
                PurchaseBasketComponent],
            providers: [
                { provide: TranslateService, useValue: translateService },
                { provide: BasketService, useValue: basketService },
                { provide: MatSnackBar, useValue: snackBar },
                { provide: UserService, useValue: userService },
                { provide: ProductService, useValue: productService },
                { provide: DeluxeGuard, useValue: deluxeGuard },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        localStorage.setItem('token', 'token')
        fixture = TestBed.createComponent(PurchaseBasketComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should load user email when being created', () => {
        userService.whoAmI.mockReturnValue(of({ email: 'a@a' }))
        component.ngOnInit()
        expect(component.userEmail).toBe('(a@a)')
    })

    it('should default to anonymous user label if userService fails to fetch the user', () => {
        userService.whoAmI.mockReturnValue(throwError('Error'))
        component.ngOnInit()
        expect(component.userEmail).toBe('(anonymous)')
    })

    it('should skip userService call and use anonymous label for guests', () => {
        userService.whoAmI.mockClear()
        localStorage.removeItem('token')

        component.ngOnInit()

        expect(userService.whoAmI).not.toHaveBeenCalled()
        expect(component.userEmail).toBe('(anonymous)')
    })

    it('should hold products returned by backend API', () => {
        basketService.find.mockReturnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { quantity: 1 } }, { name: 'Product2', price: 2, deluxePrice: 2, BasketItem: { quantity: 2 } }] }))
        component.load()
        expect(component.dataSource.length).toBe(2)
        expect(component.dataSource[0].name).toBe('Product1')
        expect(component.dataSource[0].price).toBe(1)
        expect(component.dataSource[0].BasketItem.quantity).toBe(1)
        expect(component.dataSource[1].name).toBe('Product2')
        expect(component.dataSource[1].price).toBe(2)
        expect(component.dataSource[1].BasketItem.quantity).toBe(2)
    })

    it('should have price equal to deluxePrice for deluxe users', () => {
        deluxeGuard.isDeluxe.mockReturnValue(true)
        basketService.find.mockReturnValue(of({ Products: [{ name: 'Product1', price: 2, deluxePrice: 1, BasketItem: { quantity: 1 } }] }))
        component.load()
        expect(component.dataSource.length).toBe(1)
        expect(component.dataSource[0].name).toBe('Product1')
        expect(component.dataSource[0].price).toBe(1)
    })

    it('should have price different from deluxePrice for non-deluxe users', () => {
        deluxeGuard.isDeluxe.mockReturnValue(false)
        basketService.find.mockReturnValue(of({ Products: [{ name: 'Product1', price: 2, deluxePrice: 1, BasketItem: { quantity: 1 } }] }))
        component.load()
        expect(component.dataSource.length).toBe(1)
        expect(component.dataSource[0].name).toBe('Product1')
        expect(component.dataSource[0].price).toBe(2)
    })

    it('should hold no products on error in backend API', () => {
        basketService.find.mockReturnValue(throwError('Error'))
        component.load()
        expect(component.dataSource.length).toBe(0)
    })

    it('should hold no products when none are returned by backend API', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        component.load()
        expect(component.dataSource).toEqual([])
    })

    it('should keep valid guest basket products when one guest product fetch fails', () => {
        localStorage.removeItem('token')
        basketService.getGuestBasketItems.mockReturnValue([
            { ProductId: 1, quantity: 2 },
            { ProductId: 2, quantity: 3 }
        ])
        productService.get.mockImplementation((id: number) => {
            if (id === 1) return of({ id: 1, name: 'P1', price: 2, deluxePrice: 2 })
            if (id === 2) return throwError('Error')
            return throwError('Unknown product')
        })

        component.load()

        expect(component.dataSource.length).toBe(1)
        expect(component.dataSource[0].id).toBe(1)
        expect(component.dataSource[0].BasketItem.quantity).toBe(2)
        expect(component.itemTotal).toBe(4)
    })

    it('should log error while getting Products from backend API directly to browser console', () => {
        basketService.find.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.load()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should pass delete request for basket item via BasketService', () => {
        component.delete(1)
        expect(basketService.del).toHaveBeenCalledWith(1)
    })

    it('should load again after deleting a basket item', () => {
        basketService.find.mockReturnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { quantity: 1 } }, { name: 'Product2', price: 2, deluxePrice: 2, BasketItem: { quantity: 2 } }] }))
        component.delete(1)
        expect(component.dataSource.length).toBe(2)
        expect(component.dataSource[0].name).toBe('Product1')
        expect(component.dataSource[0].price).toBe(1)
        expect(component.dataSource[0].BasketItem.quantity).toBe(1)
        expect(component.dataSource[1].name).toBe('Product2')
        expect(component.dataSource[1].price).toBe(2)
        expect(component.dataSource[1].BasketItem.quantity).toBe(2)
    })

    it('should log error while deleting basket item directly to browser console', () => {
        basketService.del.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.delete(1)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should update basket item with increased quantity after adding another item of same type', () => {
        basketService.find.mockReturnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { id: 1, quantity: 1 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.inc(1)
        expect(basketService.get).toHaveBeenCalledWith(1)
        expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 2 })
    })

    it('should not increase quantity on error retrieving basket item and log the error', () => {
        basketService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.inc(1)
        expect(console.log).toHaveBeenCalledWith('Error')
        expect(basketService.put).not.toHaveBeenCalled()
    })

    it('should not increase quantity on error updating basket item and log the error', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 }))
        basketService.put.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.inc(1)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should load again after increasing product quantity', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 2 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 3 }))
        component.inc(1)
        expect(basketService.find).toHaveBeenCalled()
    })

    it('should update basket item with decreased quantity after removing an item', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 2 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.dec(1)
        expect(basketService.get).toHaveBeenCalledWith(1)
        expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
    })

    it('should always keep one item of any product in the basket when reducing quantity via UI', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.dec(1)
        expect(basketService.get).toHaveBeenCalledWith(1)
        expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
    })

    it('should not decrease quantity on error retrieving basket item and log the error', () => {
        basketService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.dec(1)
        expect(console.log).toHaveBeenCalledWith('Error')
        expect(basketService.put).not.toHaveBeenCalled()
    })

    it('should not decrease quantity on error updating basket item and log the error', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 }))
        basketService.put.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.dec(1)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should load again after decreasing product quantity', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 2 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.dec(1)
        expect(basketService.find).toHaveBeenCalled()
    })

    it('should reset quantity to 1 when decreasing for quantity tampered to be negative', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: -100 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: -100 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.dec(1)
        expect(basketService.get).toHaveBeenCalledWith(1)
        expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
    })

    it('should reset quantity to 1 when increasing for quantity tampered to be negative', () => {
        basketService.find.mockReturnValue(of({ Products: [{ BasketItem: { id: 1, quantity: -100 } }] }))
        basketService.get.mockReturnValue(of({ id: 1, quantity: -100 }))
        basketService.put.mockReturnValue(of({ id: 1, quantity: 1 }))
        component.inc(1)
        expect(basketService.get).toHaveBeenCalledWith(1)
        expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
    })
})
