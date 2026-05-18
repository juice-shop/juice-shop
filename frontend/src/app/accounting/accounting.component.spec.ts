/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { AccountingComponent } from './accounting.component'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AccountingComponent', () => {
    let component: AccountingComponent
    let fixture: ComponentFixture<AccountingComponent>
    let productService
    let quantityService
    let orderHistoryService
    let snackBar: any

    beforeEach(async () => {
        quantityService = {
            getAll: vi.fn().mockName("QuantityService.getAll"),
            put: vi.fn().mockName("QuantityService.put")
        }
        quantityService.getAll.mockReturnValue(of([]))
        quantityService.put.mockReturnValue(of({}))
        productService = {
            search: vi.fn().mockName("ProductService.search"),
            get: vi.fn().mockName("ProductService.get"),
            put: vi.fn().mockName("ProductService.put")
        }
        productService.search.mockReturnValue(of([]))
        productService.get.mockReturnValue(of({}))
        productService.put.mockReturnValue(of({}))
        orderHistoryService = {
            getAll: vi.fn().mockName("OrderHistoryService.getAll"),
            toggleDeliveryStatus: vi.fn().mockName("OrderHistoryService.toggleDeliveryStatus")
        }
        orderHistoryService.getAll.mockReturnValue(of([]))
        orderHistoryService.toggleDeliveryStatus.mockReturnValue(of({}))
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }
        snackBar.open.mockReturnValue(null)

        TestBed.configureTestingModule({
            imports: [RouterTestingModule,
                TranslateModule.forRoot(),
                MatTableModule,
                MatPaginatorModule,
                MatFormFieldModule,
                MatDividerModule,
                MatGridListModule,
                MatCardModule,
                MatIconModule,
                MatTooltipModule,
                MatSnackBarModule,
                AccountingComponent],
            providers: [
                { provide: ProductService, useValue: productService },
                { provide: QuantityService, useValue: quantityService },
                { provide: OrderHistoryService, useValue: orderHistoryService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

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
        quantityService.getAll.mockReturnValue(of([]))
        productService.search.mockReturnValue(of([]))
        orderHistoryService.getAll.mockReturnValue(of([]))
        component.ngAfterViewInit()
        expect(quantityService.getAll).toHaveBeenCalled()
        expect(productService.search).toHaveBeenCalled()
        expect(orderHistoryService.getAll).toHaveBeenCalled()
    })

    it('should hold no products when product search API call fails', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        productService.search.mockReturnValue(throwError('Error'))
        component.loadProducts()
        fixture.detectChanges()
        expect(component.tableData).toEqual([])
    })

    it('should hold no orders when getAll orders API call fails', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        orderHistoryService.getAll.mockReturnValue(throwError('Error'))
        component.loadOrders()
        fixture.detectChanges()
        expect(component.orderData).toEqual([])
    })

    it('should hold no quantities when getAll quanitity API call fails', () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        quantityService.getAll.mockReturnValue(throwError('Error'))
        component.loadQuantity()
        fixture.detectChanges()
        expect(component.quantityMap).toEqual({})
    })

    it('should log error from product search API call directly to browser console', () => {
        productService.search.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.loadProducts()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error from getAll orders API call directly to browser console', () => {
        orderHistoryService.getAll.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.loadOrders()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should load orders when toggleDeliveryStatus gets called', () => {
        orderHistoryService.getAll.mockReturnValue(throwError('Error'))
        orderHistoryService.toggleDeliveryStatus.mockReturnValue(of({}))
        component.changeDeliveryStatus(true, 1)
        expect(orderHistoryService.getAll).toHaveBeenCalled()
    })

    it('should log error from toggleDeliveryStatus API call directly to browser console', () => {
        orderHistoryService.toggleDeliveryStatus.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.changeDeliveryStatus(true, 1)
        expect(snackBar.open).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error from getAll quantity API call directly to browser console', () => {
        quantityService.getAll.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.loadQuantity()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log and display errors while modifying price', () => {
        productService.put.mockReturnValue(throwError({ error: 'Error' }))
        console.log = vi.fn()
        component.modifyPrice(1, 100)
        fixture.detectChanges()
        expect(snackBar.open).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
    })

    it('should log and display errors while modifying quantity', () => {
        quantityService.put.mockReturnValue(throwError({ error: 'Error' }))
        console.log = vi.fn()
        component.modifyQuantity(1, 100)
        fixture.detectChanges()
        expect(snackBar.open).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith({ error: 'Error' })
    })

    it('should show confirmation on modifying quantity of a product', () => {
        quantityService.put.mockReturnValue(of({ ProductId: 1 }))
        component.tableData = [{ id: 1, name: 'Apple Juice' }]
        component.modifyQuantity(1, 100)
        fixture.detectChanges()
        expect(snackBar.open).toHaveBeenCalled()
    })

    it('should show confirmation on modifying price of a product', () => {
        productService.put.mockReturnValue(of({ name: 'Apple Juice' }))
        component.modifyPrice(1, 100)
        fixture.detectChanges()
        expect(snackBar.open).toHaveBeenCalled()
    })

    it('should modify quantity of a product', () => {
        quantityService.put.mockReturnValue(of({ ProductId: 1 }))
        component.tableData = [{ id: 1, name: 'Apple Juice' }]
        quantityService.getAll.mockReturnValue(of([]))
        component.modifyQuantity(1, 100)
        expect(quantityService.put).toHaveBeenCalled()
        expect(quantityService.getAll).toHaveBeenCalled()
    })

    it('should modify price of a product', () => {
        productService.search.mockReturnValue(of([]))
        productService.put.mockReturnValue(of({ name: 'Apple Juice' }))
        component.modifyPrice(1, 100)
        expect(productService.put).toHaveBeenCalled()
        expect(productService.search).toHaveBeenCalled()
    })
})
