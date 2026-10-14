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

    it('should map order history results to order rows with id taken from _id and expose them via orderSource', () => {
        orderHistoryService.getAll.mockReturnValue(of([
            { _id: 'mongoA', orderId: 'A', totalPrice: 12.5, delivered: true },
            { _id: 'mongoB', orderId: 'B', totalPrice: 7, delivered: false }
        ]))
        component.loadOrders()

        expect(component.orderData).toEqual([
            { id: 'mongoA', orderId: 'A', totalPrice: 12.5, delivered: true },
            { id: 'mongoB', orderId: 'B', totalPrice: 7, delivered: false }
        ])
        expect(component.orderSource.data).toEqual(component.orderData)
        expect(component.orderSource.paginator).toBe(component.paginatorOrderHistory)
    })

    it('should build the quantityMap keyed by ProductId with id and quantity from the stock response', () => {
        quantityService.getAll.mockReturnValue(of([
            { id: 11, ProductId: 1, quantity: 5 },
            { id: 22, ProductId: 2, quantity: 0 }
        ]))
        component.loadQuantity()

        expect(component.quantityMap).toEqual({
            1: { id: 11, quantity: 5 },
            2: { id: 22, quantity: 0 }
        })
    })

    it('should expose products through a MatTableDataSource wired up to the paginator', () => {
        productService.search.mockReturnValue(of([{ id: 1, name: 'A', price: 1 }, { id: 2, name: 'B', price: 2 }]))
        component.loadProducts()

        expect(component.dataSource.data).toEqual(component.tableData)
        expect(component.dataSource.paginator).toBe(component.paginator)
    })

    it('should clamp negative price values to zero when modifying price', () => {
        component.modifyPrice(1, -5)
        expect(productService.put).toHaveBeenCalledWith(1, { price: 0 })
    })

    it('should clamp negative quantity values to zero when modifying quantity', () => {
        component.modifyQuantity(1, -10)
        expect(quantityService.put).toHaveBeenCalledWith(1, { quantity: 0 })
    })

    it('should unsubscribe product and quantity subscriptions on destroy', () => {
        productService.search.mockReturnValue(of([]))
        quantityService.getAll.mockReturnValue(of([]))
        component.loadProducts()
        component.loadQuantity()
        const productUnsub = vi.spyOn((component as any).productSubscription, 'unsubscribe')
        const quantityUnsub = vi.spyOn((component as any).quantitySubscription, 'unsubscribe')

        component.ngOnDestroy()

        expect(productUnsub).toHaveBeenCalled()
        expect(quantityUnsub).toHaveBeenCalled()
    })

    it('should not throw on destroy when subscriptions were never created', () => {
        const freshFixture = TestBed.createComponent(AccountingComponent)
        const freshComponent = freshFixture.componentInstance
        expect(() => freshComponent.ngOnDestroy()).not.toThrow()
    })

    describe('template rendering', () => {
        const renderWithData = (orders: any[], products: any[] = [], quantities: any[] = []) => {
            orderHistoryService.getAll.mockReturnValue(of(orders))
            productService.search.mockReturnValue(of(products))
            quantityService.getAll.mockReturnValue(of(quantities))
            const f = TestBed.createComponent(AccountingComponent)
            f.componentInstance.ngAfterViewInit()
            f.detectChanges()
            return f
        }

        it('should render the accounting heading and both section titles', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')?.textContent).toBeTruthy()
            const headings = Array.from(compiled.querySelectorAll('.heading'))
            expect(headings.length).toBe(2)
        })

        it('should render a row per order with the order id and total price formatted with two decimals', () => {
            const f = renderWithData([
                { _id: 'm1', orderId: 'ORD-1', totalPrice: 9.5, delivered: true }
            ])
            const text = (f.nativeElement as HTMLElement).textContent ?? ''
            expect(text).toContain('ORD-1')
            expect(text).toContain('9.50')
        })

        it('should show the delivered marker and the mark-as-transit button for delivered orders', () => {
            const f = renderWithData([
                { _id: 'm1', orderId: 'd', totalPrice: 1, delivered: true }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.confirmation')).toBeTruthy()
            expect(compiled.querySelector('.error')).toBeNull()
            const icons = Array.from(compiled.querySelectorAll('mat-icon')).map(e => e.textContent?.trim())
            expect(icons).toContain('cached')
            expect(icons).not.toContain('check_circle')
        })

        it('should show the in-transit marker and the mark-as-delivered button for non-delivered orders', () => {
            const f = renderWithData([
                { _id: 'm1', orderId: 'n', totalPrice: 1, delivered: false }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.error')).toBeTruthy()
            expect(compiled.querySelector('.confirmation')).toBeNull()
            const icons = Array.from(compiled.querySelectorAll('mat-icon')).map(e => e.textContent?.trim())
            expect(icons).toContain('check_circle')
            expect(icons).not.toContain('cached')
        })

        it('should invoke changeDeliveryStatus with current delivered flag and order id when the status button is clicked', () => {
            const f = renderWithData([
                { _id: 42, orderId: 'click', totalPrice: 1, delivered: true }
            ])
            const comp = f.componentInstance
            const spy = vi.spyOn(comp, 'changeDeliveryStatus').mockImplementation(() => { })
            const button = f.nativeElement.querySelector('.orders-table button[mat-icon-button]') as HTMLButtonElement
            expect(button).toBeTruthy()
            button.click()
            expect(spy).toHaveBeenCalledWith(true, 42)
        })

        it('should render a row per product with price and quantity inputs that invoke modify handlers on click', () => {
            const f = renderWithData(
                [],
                [{ id: 7, name: 'Apple Juice', price: 1.99 }],
                [{ id: 99, ProductId: 7, quantity: 42 }]
            )
            const comp = f.componentInstance
            const priceSpy = vi.spyOn(comp, 'modifyPrice').mockImplementation(() => { })
            const quantitySpy = vi.spyOn(comp, 'modifyQuantity').mockImplementation(() => { })

            const inputs = f.nativeElement.querySelectorAll('.inventory-table input[matInput]') as NodeListOf<HTMLInputElement>
            expect(inputs.length).toBe(2)
            expect(inputs[0].value).toBe('1.99')
            expect(inputs[1].value).toBe('42')

            const buttons = f.nativeElement.querySelectorAll('.inventory-table button[mat-icon-button]') as NodeListOf<HTMLButtonElement>
            expect(buttons.length).toBe(2)
            buttons[0].click()
            buttons[1].click()

            expect(priceSpy).toHaveBeenCalledWith(7, '1.99')
            expect(quantitySpy).toHaveBeenCalledWith(99, '42')
        })

        it('should render two paginators, one for each table', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelectorAll('mat-paginator').length).toBe(2)
        })
    })
})
