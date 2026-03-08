/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
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
  let productService: jasmine.SpyObj<ProductService>
  let basketService: jasmine.SpyObj<BasketService>
  let translateService: TranslateService
  let translateServiceGetSpy: jasmine.Spy
  let dialog: jasmine.SpyObj<MatDialog>
  let snackBarHelper: jasmine.SpyObj<SnackBarHelperService>

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
    dialog = jasmine.createSpyObj('MatDialog', ['open'])
    productService = jasmine.createSpyObj('ProductService', ['search', 'get'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({ name: 'test' } as any))
    basketService = jasmine.createSpyObj('BasketService', ['find', 'get', 'put', 'save', 'updateNumberOfCartItems', 'addGuestBasketItem'])
    basketService.find.and.returnValue(of({ Products: [] } as any))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 } as any))
    basketService.put.and.returnValue(of({ ProductId: 1 } as any))
    basketService.save.and.returnValue(of({ ProductId: 1 } as any))
    snackBarHelper = jasmine.createSpyObj('SnackBarHelperService', ['open'])

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
    translateServiceGetSpy = spyOn(translateService, 'get').and.returnValue(of('ok'))

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
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.search.and.returnValue(of([]))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    productService.get.and.returnValue(of({ name: 'Cherry Juice' }))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(1)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.save).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(translateServiceGetSpy).toHaveBeenCalledWith('BASKET_ADD_PRODUCT', { product: 'Cherry Juice' })
  })

  it('should translate BASKET_ADD_PRODUCT message', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.search.and.returnValue(of([]))
    basketService.save.and.returnValue(of({ ProductId: 1 }))
    productService.get.and.returnValue(of({ name: 'Cherry Juice' }))
    translateServiceGetSpy.and.returnValue(of('Translation of BASKET_ADD_PRODUCT'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(1)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.save).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(snackBarHelper.open).toHaveBeenCalled()
  })

  it('should add similar product to basket', () => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(of({ id: 42, quantity: 5 }))
    basketService.put.and.returnValue(of({ ProductId: 2 }))
    productService.get.and.returnValue(of({ name: 'Tomato Juice' }))
    translateServiceGetSpy.and.returnValue(of(undefined))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.get).toHaveBeenCalled()
    expect(basketService.put).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
    expect(translateServiceGetSpy).toHaveBeenCalledWith('BASKET_ADD_SAME_PRODUCT', { product: 'Tomato Juice' })
  })

  it('should translate BASKET_ADD_SAME_PRODUCT message', () => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(of({ id: 42, quantity: 5 }))
    basketService.put.and.returnValue(of({ ProductId: 2 }))
    productService.get.and.returnValue(of({ name: 'Tomato Juice' }))
    translateServiceGetSpy.and.returnValue(of('Translation of BASKET_ADD_SAME_PRODUCT'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(basketService.find).toHaveBeenCalled()
    expect(basketService.get).toHaveBeenCalled()
    expect(basketService.put).toHaveBeenCalled()
    expect(productService.get).toHaveBeenCalled()
  })

  it('should not add anything to basket on error retrieving basket', fakeAsync(() => {
    basketService.find.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '815')
    component.addToBasket(undefined)
    expect(snackBarHelper.open).not.toHaveBeenCalled()
  }))

  it('should queue product in session storage when user is not logged in', () => {
    fixture.componentRef.setInput('isLoggedIn', false)
    fixture.detectChanges()

    component.addToBasket(3)

    expect(basketService.addGuestBasketItem).toHaveBeenCalledWith(3)
    expect(basketService.find).not.toHaveBeenCalled()
  })

  it('should log errors retrieving basket directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '815')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything to basket on error retrieving existing basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(snackBarHelper.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.get.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log errors updating basket directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    basketService.put.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything to basket on error retrieving product associated with basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    productService.get.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(snackBarHelper.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving product associated with basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ id: 1 }, { id: 2, name: 'Tomato Juice', BasketItem: { id: 42 } }] }))
    productService.get.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    console.log = jasmine.createSpy('log')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should not add anything on error creating new basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.save.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(snackBarHelper.open).toHaveBeenCalled()
  }))

  it('should log errors creating new basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.save.and.returnValue(throwError(() => 'Error'))
    console.log = jasmine.createSpy('log')
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(snackBarHelper.open).toHaveBeenCalled()
  }))

  it('should not add anything on error retrieving product after creating new basket item', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.get.and.returnValue(throwError(() => 'Error'))
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(snackBarHelper.open).not.toHaveBeenCalled()
  }))

  it('should log errors retrieving product after creating new basket item directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [] }))
    productService.get.and.returnValue(throwError(() => 'Error'))
    console.log = jasmine.createSpy('log')
    sessionStorage.setItem('bid', '4711')
    component.addToBasket(2)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
