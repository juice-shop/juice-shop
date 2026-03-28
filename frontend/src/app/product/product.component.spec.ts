/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDialog } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { provideZoneChangeDetection } from '@angular/core'

import { ProductComponent } from './product.component'
import { ProductDetailsComponent } from '../product-details/product-details.component'
import { type Product, type ProductTableEntry } from '../Models/product.model'
import { ProductService } from '../Services/product.service'
import { BasketService } from '../Services/basket.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

describe('ProductComponent', () => {
    let component: ProductComponent
    let fixture: ComponentFixture<ProductComponent>
    let productService: any
    let basketService: any
    let translateService: TranslateService
    let translateServiceGetSpy: any
    let dialog: any
    let snackBarHelper: any

    const testProduct: ProductTableEntry = {
        id: 1,
        name: 'Apple Juice',
        description: 'test product',
        image: 'apple_juice.jpg',
        price: 1.99,
        deluxePrice: 1.99,
        quantity: 5
    }

    beforeEach(async () => {
        dialog = {
            open: vi.fn().mockName("MatDialog.open")
        }
        productService = {
            search: vi.fn().mockName("ProductService.search"),
            get: vi.fn().mockName("ProductService.get")
        }
        productService.search.mockReturnValue(of([]))
        productService.get.mockReturnValue(of({ name: 'test' } as any))
        basketService = {
            find: vi.fn().mockName("BasketService.find"),
            get: vi.fn().mockName("BasketService.get"),
            put: vi.fn().mockName("BasketService.put"),
            save: vi.fn().mockName("BasketService.save"),
            updateNumberOfCartItems: vi.fn().mockName("BasketService.updateNumberOfCartItems")
        }
        basketService.find.mockReturnValue(of({ Products: [] } as any))
        basketService.get.mockReturnValue(of({ id: 1, quantity: 1 } as any))
        basketService.put.mockReturnValue(of({ ProductId: 1 } as any))
        basketService.save.mockReturnValue(of({ ProductId: 1 } as any))
        snackBarHelper = {
            open: vi.fn().mockName("SnackBarHelperService.open")
        }

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ProductComponent],
            providers: [
                { provide: MatDialog, useValue: dialog },
                { provide: ProductService, useValue: productService },
                { provide: BasketService, useValue: basketService },
                { provide: SnackBarHelperService, useValue: snackBarHelper },
                provideZoneChangeDetection(),
            ]
        })
            .compileComponents()

        translateService = TestBed.inject(TranslateService)
        translateServiceGetSpy = vi.spyOn(translateService, 'get').mockReturnValue(of('ok'))

        fixture = TestBed.createComponent(ProductComponent)
        component = fixture.componentInstance
        fixture.componentRef.setInput('item', testProduct)
        fixture.componentRef.setInput('isLoggedIn', true)
        fixture.componentRef.setInput('isDeluxe', false)
        fixture.detectChanges()
    })

    it('should open a modal dialog with product details', () => {
        component.showDetail({ id: 42 } as Product)
        expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
            width: '500px',
            height: 'max-content',
            data: {
                productData: { id: 42 }
            }
        })
    })

    it('should add new product to basket', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        productService.search.mockReturnValue(of([]))
        basketService.save.mockReturnValue(of({ ProductId: 1 }))
        productService.get.mockReturnValue(of({ name: 'Cherry Juice' }))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(1)
        expect(basketService.find).toHaveBeenCalled()
        expect(basketService.save).toHaveBeenCalled()
        expect(productService.get).toHaveBeenCalled()
        expect(translateServiceGetSpy).toHaveBeenCalledWith('BASKET_ADD_PRODUCT', { product: 'Cherry Juice' })
    })

    it('should translate BASKET_ADD_PRODUCT message', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        productService.search.mockReturnValue(of([]))
        basketService.save.mockReturnValue(of({ ProductId: 1 }))
        productService.get.mockReturnValue(of({ name: 'Cherry Juice' }))
        translateServiceGetSpy.mockReturnValue(of('Translation of BASKET_ADD_PRODUCT'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(1)
        expect(basketService.find).toHaveBeenCalled()
        expect(basketService.save).toHaveBeenCalled()
        expect(productService.get).toHaveBeenCalled()
        expect(snackBarHelper.open).toHaveBeenCalled()
    })

    it('should add similar product to basket', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        basketService.get.mockReturnValue(of({ id: 42, quantity: 5 }))
        basketService.put.mockReturnValue(of({ ProductId: 2 }))
        productService.get.mockReturnValue(of({ name: 'Tomato Juice' }))
        translateServiceGetSpy.mockReturnValue(of(undefined))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(basketService.find).toHaveBeenCalled()
        expect(basketService.get).toHaveBeenCalled()
        expect(basketService.put).toHaveBeenCalled()
        expect(productService.get).toHaveBeenCalled()
        expect(translateServiceGetSpy).toHaveBeenCalledWith('BASKET_ADD_SAME_PRODUCT', { product: 'Tomato Juice' })
    })

    it('should translate BASKET_ADD_SAME_PRODUCT message', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        basketService.get.mockReturnValue(of({ id: 42, quantity: 5 }))
        basketService.put.mockReturnValue(of({ ProductId: 2 }))
        productService.get.mockReturnValue(of({ name: 'Tomato Juice' }))
        translateServiceGetSpy.mockReturnValue(of('Translation of BASKET_ADD_SAME_PRODUCT'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(basketService.find).toHaveBeenCalled()
        expect(basketService.get).toHaveBeenCalled()
        expect(basketService.put).toHaveBeenCalled()
        expect(productService.get).toHaveBeenCalled()
    })

    it('should not add anything to basket on error retrieving basket', () => {
        basketService.find.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '815')
        component.addToBasket(undefined)
        expect(snackBarHelper.open).not.toHaveBeenCalled()
    })

    it('should log errors retrieving basket directly to browser console', () => {
        basketService.find.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '815')
        console.log = vi.fn()
        component.addToBasket(2)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should not add anything to basket on error retrieving existing basket item', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        basketService.get.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(snackBarHelper.open).not.toHaveBeenCalled()
    })

    it('should log errors retrieving basket item directly to browser console', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        basketService.get.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        console.log = vi.fn()
        component.addToBasket(2)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log errors updating basket directly to browser console', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        basketService.put.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        console.log = vi.fn()
        component.addToBasket(2)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should not add anything to basket on error retrieving product associated with basket item', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        productService.get.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(snackBarHelper.open).not.toHaveBeenCalled()
    })

    it('should log errors retrieving product associated with basket item directly to browser console', () => {
        basketService.find.mockReturnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
        productService.get.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        console.log = vi.fn()
        component.addToBasket(2)
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should not add anything on error creating new basket item', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.save.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(snackBarHelper.open).toHaveBeenCalled()
    })

    it('should log errors creating new basket item directly to browser console', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.save.mockReturnValue(throwError(() => 'Error'))
        console.log = vi.fn()
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(snackBarHelper.open).toHaveBeenCalled()
    })

    it('should not add anything on error retrieving product after creating new basket item', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        productService.get.mockReturnValue(throwError(() => 'Error'))
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(snackBarHelper.open).not.toHaveBeenCalled()
    })

    it('should log errors retrieving product after creating new basket item directly to browser console', () => {
        basketService.find.mockReturnValue(of({ Products: [] }))
        productService.get.mockReturnValue(throwError(() => 'Error'))
        console.log = vi.fn()
        sessionStorage.setItem('bid', '4711')
        component.addToBasket(2)
        expect(console.log).toHaveBeenCalledWith('Error')
    })
})
