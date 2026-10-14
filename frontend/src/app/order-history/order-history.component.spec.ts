/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ProductService } from '../Services/product.service'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
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
import { BasketService } from '../Services/basket.service'
import { Router } from '@angular/router'

describe('AccountingComponent', () => {
    let component: OrderHistoryComponent
    let fixture: ComponentFixture<OrderHistoryComponent>
    let productService
    let orderHistoryService
    let dialog: any
    let basketService: any
    let router: any

    beforeEach(async () => {
        dialog = {
            open: vi.fn().mockName("MatDialog.open")
        }
        dialog.open.mockReturnValue(null)
        productService = {
            get: vi.fn().mockName("ProductService.get")
        }
        productService.get.mockReturnValue(of({}))
        orderHistoryService = {
            get: vi.fn().mockName("OrderHistoryService.get")
        }
        orderHistoryService.get.mockReturnValue(of([]))
        basketService = { hostServer: 'http://host.example' }
        router = { navigate: vi.fn().mockName("Router.navigate").mockResolvedValue(true) }

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
                MatDialogModule,
                MatExpansionModule,
                OrderHistoryComponent],
            providers: [
                { provide: ProductService, useValue: productService },
                { provide: OrderHistoryService, useValue: orderHistoryService },
                { provide: MatDialog, useValue: dialog },
                { provide: BasketService, useValue: basketService },
                { provide: Router, useValue: router },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

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
        orderHistoryService.get.mockReturnValue(of([]))
        component.ngOnInit()
        expect(component.emptyState).toBe(true)
        expect(component.orders).toEqual([])
    })

    it('should make emptyState false when get Order History gives non empty response', () => {
        orderHistoryService.get.mockReturnValue(of([{ orderId: 'a', totalPrice: 1, bonus: 0, products: [{}], delivered: true }]))
        component.ngOnInit()
        expect(component.emptyState).toBe(false)
    })

    it('should log error from get order history API call directly to browser console', () => {
        orderHistoryService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error from get product API call directly to browser console', () => {
        productService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.showDetail(1)
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should open a modal dialog when showDetail is called', () => {
        productService.get.mockReturnValue(of({ id: 42, name: 'A', description: 'B', image: 'C', price: 10 } as Product))
        component.showDetail(42)
        expect(productService.get).toHaveBeenCalled()
        expect(dialog.open).toHaveBeenCalledWith(ProductDetailsComponent, {
            width: '500px',
            height: 'max-content',
            data: {
                productData: { id: 42, name: 'A', description: 'B', image: 'C', price: 10, deluxePrice: undefined, points: 1 }
            }
        })
    })

    it('should reverse the order list and map all order fields including products', () => {
        orderHistoryService.get.mockReturnValue(of([
            { orderId: 'first', totalPrice: 10, bonus: 1, products: [{ id: 1, name: 'P1', price: 5, quantity: 2, total: 10 }], delivered: true },
            { orderId: 'second', totalPrice: 20, bonus: 2, products: [{ id: 2, name: 'P2', price: 10, quantity: 2, total: 20 }], delivered: false }
        ]))
        component.orders = []
        component.ngOnInit()

        expect(component.orders.length).toBe(2)
        expect(component.orders[0].orderId).toBe('second')
        expect(component.orders[1].orderId).toBe('first')
        expect(component.orders[0].delivered).toBe(false)
        expect(component.orders[1].delivered).toBe(true)
        expect(component.orders[1].products.data).toEqual([{ id: 1, name: 'P1', price: 5, quantity: 2, total: 10 }])
    })

    it('should round points to nearest integer when opening product details', () => {
        productService.get.mockReturnValue(of({ id: 7, name: 'X', description: 'D', image: 'I', price: 19, deluxePrice: 15 } as Product))
        component.showDetail(7)
        const passed = dialog.open.mock.calls[0][1].data.productData
        expect(passed.points).toBe(2)
        expect(passed.deluxePrice).toBe(15)
    })

    it('should open the order confirmation PDF in a new tab using the basket host server', () => {
        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
        component.openConfirmationPDF('abc123')
        expect(openSpy).toHaveBeenCalledWith('http://host.example/ftp/order_abc123.pdf', '_blank')
        openSpy.mockRestore()
    })

    it('should navigate to /track-result with the order id as a query parameter when tracking an order', async () => {
        component.trackOrder('xyz')
        await Promise.resolve()
        expect(router.navigate).toHaveBeenCalledWith(['/track-result'], { queryParams: { id: 'xyz' } })
    })

    describe('template rendering', () => {
        const renderWithOrders = (orders: any[]) => {
            orderHistoryService.get.mockReturnValue(of(orders))
            const f = TestBed.createComponent(OrderHistoryComponent)
            f.detectChanges()
            return f
        }

        it('should render the empty state placeholder when there are no orders', () => {
            const f = renderWithOrders([])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.emptyState')).toBeTruthy()
            expect(compiled.querySelector('img.noResult')).toBeTruthy()
            expect(compiled.querySelector('.orders-container')).toBeNull()
        })

        it('should render one orders-container with a row per order when orders are present', () => {
            const f = renderWithOrders([
                { orderId: 'o1', totalPrice: 1.2, bonus: 5, products: [], delivered: true },
                { orderId: 'o2', totalPrice: 3.45, bonus: 7, products: [], delivered: false }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.emptyState')).toBeNull()
            expect(compiled.querySelectorAll('.table-container').length).toBe(2)
        })

        it('should format the total price with two decimals and render the order id and bonus', () => {
            const f = renderWithOrders([
                { orderId: 'order-42', totalPrice: 9.5, bonus: 3, products: [], delivered: true }
            ])
            const text = (f.nativeElement as HTMLElement).textContent ?? ''
            expect(text).toContain('#order-42')
            expect(text).toContain('9.50')
            expect(text).toContain('3')
        })

        it('should show the delivered confirmation for delivered orders and not the in-transit marker', () => {
            const f = renderWithOrders([
                { orderId: 'd', totalPrice: 1, bonus: 0, products: [], delivered: true }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.confirmation')).toBeTruthy()
            expect(compiled.querySelector('.error')).toBeNull()
        })

        it('should show the in-transit marker for non-delivered orders and not the delivered confirmation', () => {
            const f = renderWithOrders([
                { orderId: 'n', totalPrice: 1, bonus: 0, products: [], delivered: false }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('.error')).toBeTruthy()
            expect(compiled.querySelector('.confirmation')).toBeNull()
        })

        it('should wire the track and print buttons to their respective component methods', () => {
            const f = renderWithOrders([
                { orderId: 'btn', totalPrice: 1, bonus: 0, products: [], delivered: true }
            ])
            const comp = f.componentInstance
            const trackSpy = vi.spyOn(comp, 'trackOrder').mockImplementation(() => { })
            const printSpy = vi.spyOn(comp, 'openConfirmationPDF').mockImplementation(() => { })
            const compiled: HTMLElement = f.nativeElement
            const trackBtn = compiled.querySelector('button[aria-label="Track Your Order"]') as HTMLButtonElement
            const printBtn = compiled.querySelector('button[aria-label="Print order confirmation"]') as HTMLButtonElement
            expect(trackBtn).toBeTruthy()
            expect(printBtn).toBeTruthy()
            trackBtn.click()
            printBtn.click()
            expect(trackSpy).toHaveBeenCalledWith('btn')
            expect(printSpy).toHaveBeenCalledWith('btn')
        })
    })
})
