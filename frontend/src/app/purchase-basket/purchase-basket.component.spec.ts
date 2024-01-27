/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { BasketService } from '../Services/basket.service'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { UserService } from '../Services/user.service'
import { DeluxeGuard } from '../app.guard'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { EventEmitter } from '@angular/core'

describe('PurchaseBasketComponent', () => {
  let component: PurchaseBasketComponent
  let fixture: ComponentFixture<PurchaseBasketComponent>
  let basketService
  let userService
  let translateService: any
  let deluxeGuard
  let snackBar: any

  beforeEach(waitForAsync(() => {
    basketService = jasmine.createSpyObj('BasketService', ['find', 'del', 'get', 'put', 'updateNumberOfCartItems'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.del.and.returnValue(of({}))
    basketService.get.and.returnValue(of({}))
    basketService.put.and.returnValue(of({}))
    basketService.updateNumberOfCartItems.and.returnValue(of({}))
    userService = jasmine.createSpyObj('UserService', ['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    deluxeGuard = jasmine.createSpyObj('', ['isDeluxe'])
    deluxeGuard.isDeluxe.and.returnValue(false)
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])

    TestBed.configureTestingModule({
      declarations: [PurchaseBasketComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: BasketService, useValue: basketService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: UserService, useValue: userService },
        { provide: DeluxeGuard, useValue: deluxeGuard }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseBasketComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load user email when being created', () => {
    userService.whoAmI.and.returnValue(of({ email: 'a@a' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('(a@a)')
  })

  it('should log an error if userService fails to fetch the user', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold products returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { quantity: 1 } }, { name: 'Product2', price: 2, deluxePrice: 2, BasketItem: { quantity: 2 } }] }))
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
    deluxeGuard.isDeluxe.and.returnValue(true)
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 2, deluxePrice: 1, BasketItem: { quantity: 1 } }] }))
    component.load()
    expect(component.dataSource.length).toBe(1)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[0].price).toBe(1)
  })

  it('should have price different from deluxePrice for non-deluxe users', () => {
    deluxeGuard.isDeluxe.and.returnValue(false)
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 2, deluxePrice: 1, BasketItem: { quantity: 1 } }] }))
    component.load()
    expect(component.dataSource.length).toBe(1)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[0].price).toBe(2)
  })

  it('should hold no products on error in backend API', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    component.load()
    expect(component.dataSource.length).toBe(0)
  }))

  it('should hold no products when none are returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    component.load()
    expect(component.dataSource).toEqual([])
  })

  it('should log error while getting Products from backend API directly to browser console', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.load()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should pass delete request for basket item via BasketService', () => {
    component.delete(1)
    expect(basketService.del).toHaveBeenCalledWith(1)
  })

  it('should load again after deleting a basket item', () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { quantity: 1 } }, { name: 'Product2', price: 2, deluxePrice: 2, BasketItem: { quantity: 2 } }] }))
    component.delete(1)
    expect(component.dataSource.length).toBe(2)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[0].price).toBe(1)
    expect(component.dataSource[0].BasketItem.quantity).toBe(1)
    expect(component.dataSource[1].name).toBe('Product2')
    expect(component.dataSource[1].price).toBe(2)
    expect(component.dataSource[1].BasketItem.quantity).toBe(2)
  })

  it('should log error while deleting basket item directly to browser console', fakeAsync(() => {
    basketService.del.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.delete(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should update basket item with increased quantity after adding another item of same type', () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 1, deluxePrice: 1, BasketItem: { id: 1, quantity: 1 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    component.inc(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 2 })
  })

  it('should not increase quantity on error retrieving basket item and log the error', fakeAsync(() => {
    basketService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.inc(1)
    expect(console.log).toHaveBeenCalledWith('Error')
    expect(basketService.put).not.toHaveBeenCalled()
  }))

  it('should not increase quantity on error updating basket item and log the error', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.inc(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should load again after increasing product quantity', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 3 }))
    component.inc(1)
    expect(basketService.find).toHaveBeenCalled()
  })

  it('should update basket item with decreased quantity after removing an item', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))
    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })

  it('should always keep one item of any product in the basket when reducing quantity via UI', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))
    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })

  it('should not decrease quantity on error retrieving basket item and log the error', fakeAsync(() => {
    basketService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.dec(1)
    expect(console.log).toHaveBeenCalledWith('Error')
    expect(basketService.put).not.toHaveBeenCalled()
  }))

  it('should not decrease quantity on error updating basket item and log the error', fakeAsync(() => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 1 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 1 }))
    basketService.put.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.dec(1)
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should load again after decreasing product quantity', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: 2 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: 2 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))
    component.dec(1)
    expect(basketService.find).toHaveBeenCalled()
  })

  it('should reset quantity to 1 when decreasing for quantity tampered to be negative', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: -100 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: -100 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))
    component.dec(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })

  it('should reset quantity to 1 when increasing for quantity tampered to be negative', () => {
    basketService.find.and.returnValue(of({ Products: [{ BasketItem: { id: 1, quantity: -100 } }] }))
    basketService.get.and.returnValue(of({ id: 1, quantity: -100 }))
    basketService.put.and.returnValue(of({ id: 1, quantity: 1 }))
    component.inc(1)
    expect(basketService.get).toHaveBeenCalledWith(1)
    expect(basketService.put).toHaveBeenCalledWith(1, { quantity: 1 })
  })
})
