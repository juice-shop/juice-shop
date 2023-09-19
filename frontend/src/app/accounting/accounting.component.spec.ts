/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { AccountingComponent } from './accounting.component'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { QuantityService } from '../Services/quantity.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { OrderHistoryService } from '../Services/order-history.service'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

describe('AccountingComponent', () => {
  let component: AccountingComponent
  let fixture: ComponentFixture<AccountingComponent>
  let productService
  let quantityService
  let orderHistoryService
  let snackBar: any

  beforeEach(waitForAsync(() => {
    quantityService = jasmine.createSpyObj('QuantityService', ['getAll', 'put'])
    quantityService.getAll.and.returnValue(of([]))
    quantityService.put.and.returnValue(of({}))
    productService = jasmine.createSpyObj('ProductService', ['search', 'get', 'put'])
    productService.search.and.returnValue(of([]))
    productService.get.and.returnValue(of({}))
    productService.put.and.returnValue(of({}))
    orderHistoryService = jasmine.createSpyObj('OrderHistoryService', ['getAll', 'toggleDeliveryStatus'])
    orderHistoryService.getAll.and.returnValue(of([]))
    orderHistoryService.toggleDeliveryStatus.and.returnValue(of({}))
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    snackBar.open.and.returnValue(null)

    TestBed.configureTestingModule({
      declarations: [AccountingComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: QuantityService, useValue: quantityService },
        { provide: OrderHistoryService, useValue: orderHistoryService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingComponent)
    component = fixture.componentInstance
    component.ngAfterViewInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load products, quantitites and orders when initiated', () => {
    quantityService.getAll.and.returnValue(of([]))
    productService.search.and.returnValue(of([]))
    orderHistoryService.getAll.and.returnValue(of([]))
    component.ngAfterViewInit()
    expect(quantityService.getAll).toHaveBeenCalled()
    expect(productService.search).toHaveBeenCalled()
    expect(orderHistoryService.getAll).toHaveBeenCalled()
  })

  it('should hold no products when product search API call fails', () => {
    productService.search.and.returnValue(throwError('Error'))
    component.loadProducts()
    fixture.detectChanges()
    expect(component.tableData).toEqual([])
  })

  it('should hold no orders when getAll orders API call fails', () => {
    orderHistoryService.getAll.and.returnValue(throwError('Error'))
    component.loadOrders()
    fixture.detectChanges()
    expect(component.orderData).toEqual([])
  })

  it('should hold no quantities when getAll quanitity API call fails', () => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    component.loadQuantity()
    fixture.detectChanges()
    expect(component.quantityMap).toEqual({})
  })

  it('should log error from product search API call directly to browser console', fakeAsync(() => {
    productService.search.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.loadProducts()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from getAll orders API call directly to browser console', fakeAsync(() => {
    orderHistoryService.getAll.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.loadOrders()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should load orders when toggleDeliveryStatus gets called', () => {
    orderHistoryService.getAll.and.returnValue(throwError('Error'))
    orderHistoryService.toggleDeliveryStatus.and.returnValue(of({}))
    component.changeDeliveryStatus(true, 1)
    expect(orderHistoryService.getAll).toHaveBeenCalled()
  })

  it('should log error from toggleDeliveryStatus API call directly to browser console', fakeAsync(() => {
    orderHistoryService.toggleDeliveryStatus.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.changeDeliveryStatus(true, 1)
    expect(snackBar.open).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from getAll quantity API call directly to browser console', fakeAsync(() => {
    quantityService.getAll.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.loadQuantity()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log and display errors while modifying price', fakeAsync(() => {
    productService.put.and.returnValue(throwError({ error: 'Error' }))
    console.log = jasmine.createSpy('log')
    component.modifyPrice(1, 100)
    fixture.detectChanges()
    expect(snackBar.open).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
  }))

  it('should log and display errors while modifying quantity', fakeAsync(() => {
    quantityService.put.and.returnValue(throwError({ error: 'Error' }))
    console.log = jasmine.createSpy('log')
    component.modifyQuantity(1, 100)
    fixture.detectChanges()
    expect(snackBar.open).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
  }))

  it('should show confirmation on modifying quantity of a product', fakeAsync(() => {
    quantityService.put.and.returnValue(of({ ProductId: 1 }))
    component.tableData = [{ id: 1, name: 'Apple Juice' }]
    component.modifyQuantity(1, 100)
    fixture.detectChanges()
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should show confirmation on modifying price of a product', fakeAsync(() => {
    productService.put.and.returnValue(of({ name: 'Apple Juice' }))
    component.modifyPrice(1, 100)
    fixture.detectChanges()
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should modify quantity of a product', () => {
    quantityService.put.and.returnValue(of({ ProductId: 1 }))
    component.tableData = [{ id: 1, name: 'Apple Juice' }]
    quantityService.getAll.and.returnValue(of([]))
    component.modifyQuantity(1, 100)
    expect(quantityService.put).toHaveBeenCalled()
    expect(quantityService.getAll).toHaveBeenCalled()
  })

  it('should modify price of a product', () => {
    productService.search.and.returnValue(of([]))
    productService.put.and.returnValue(of({ name: 'Apple Juice' }))
    component.modifyPrice(1, 100)
    expect(productService.put).toHaveBeenCalled()
    expect(productService.search).toHaveBeenCalled()
  })
})
