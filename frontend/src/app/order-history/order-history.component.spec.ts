/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { of } from 'rxjs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { OrderHistoryService } from '../Services/order-history.service'
import { OrderHistoryComponent } from './order-history.component'
import { type Product } from '../Models/product.model'
import { ProductDetailsComponent } from '../product-details/product-details.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AccountingComponent', () => {
  let component: OrderHistoryComponent
  let fixture: ComponentFixture<OrderHistoryComponent>
  let productService
  let orderHistoryService
  let dialog: any

  beforeEach(waitForAsync(() => {
    dialog = jasmine.createSpyObj('MatDialog', ['open'])
    dialog.open.and.returnValue(null)
    productService = jasmine.createSpyObj('ProductService', ['get'])
    productService.get.and.returnValue(of({}))
    orderHistoryService = jasmine.createSpyObj('OrderHistoryService', ['get'])
    orderHistoryService.get.and.returnValue(of([]))

    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
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
        MatDialogModule,
        MatExpansionModule,
        OrderHistoryComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: OrderHistoryService, useValue: orderHistoryService },
        { provide: MatDialog, useValue: dialog },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHistoryComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should make emptyState true and hold no orders when get Order History gives empty response', () => {
    orderHistoryService.get.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.emptyState).toBe(true)
    expect(component.orders).toEqual([])
  })

  it('should make emptyState false when get Order History gives non empty response', () => {
    orderHistoryService.get.and.returnValue(of([{ orderId: 'a', totalPrice: 1, bonus: 0, products: [{}], delivered: true }]))
    component.ngOnInit()
    expect(component.emptyState).toBe(false)
  })

  it('should log error from get order history API call directly to browser console', fakeAsync(() => {
    orderHistoryService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from get product API call directly to browser console', fakeAsync(() => {
    productService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.showDetail(1)
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should open a modal dialog when showDetail is called', () => {
    productService.get.and.returnValue(of({ id: 42, name: 'A', description: 'B', image: 'C', price: 10 } as Product))
    component.showDetail(42)
    expect(productService.get).toHaveBeenCalled()
    expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
      width: '500px',
      height: 'max-content',
      data: {
        productData: { id: 42, name: 'A', description: 'B', image: 'C', price: 10, points: 1 }
      }
    })
  })
})
