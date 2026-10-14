/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { OrderSummaryComponent } from './order-summary.component'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { RouterTestingModule } from '@angular/router/testing'
import { BasketService } from '../Services/basket.service'
import { AddressService } from '../Services/address.service'
import { of } from 'rxjs/internal/observable/of'
import { throwError } from 'rxjs'
import { PaymentService } from '../Services/payment.service'
import { OrderCompletionComponent } from '../order-completion/order-completion.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DeliveryService } from '../Services/delivery.service'
import { DeluxeGuard } from '../app.guard'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('OrderSummaryComponent', () => {
    let component: OrderSummaryComponent
    let fixture: ComponentFixture<OrderSummaryComponent>
    let basketService: any
    let addressService: any
    let paymentService: any
    let deliveryService: any
    let deluxeGuard
    let snackBar: any

    beforeEach(async () => {
        addressService = {
            getById: vi.fn().mockName("AddressService.getById")
        }
        addressService.getById.mockReturnValue(of([]))
        basketService = {
            checkout: vi.fn().mockName("BasketService.checkout"),
            find: vi.fn().mockName("BasketService.find"),
            updateNumberOfCartItems: vi.fn().mockName("BasketService.updateNumberOfCartItems"),
            getGuestBasketItems: vi.fn().mockName("BasketService.getGuestBasketItems")
        }
        basketService.find.mockReturnValue(of({ Products: [] }))
        basketService.checkout.mockReturnValue(of({}))
        basketService.updateNumberOfCartItems.mockReturnValue(of({}))
        basketService.getGuestBasketItems.mockReturnValue([])
        paymentService = {
            getById: vi.fn().mockName("PaymentService.getById")
        }
        paymentService.getById.mockReturnValue(of([]))
        deliveryService = {
            getById: vi.fn().mockName("DeliveryService.getById")
        }
        deliveryService.getById.mockReturnValue(of({ price: 10 }))
        deluxeGuard = {
            isDeluxe: vi.fn()
        }
        deluxeGuard.isDeluxe.mockReturnValue(false)
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'order-completion', component: OrderCompletionComponent }
                ]),
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatInputModule,
                MatCardModule,
                MatTableModule,
                MatButtonModule,
                MatButtonToggleModule,
                MatIconModule,
                MatTooltipModule,
                MatSnackBarModule,
                OrderSummaryComponent, PurchaseBasketComponent, OrderCompletionComponent],
            providers: [
                { provide: BasketService, useValue: basketService },
                { provide: AddressService, useValue: addressService },
                { provide: PaymentService, useValue: paymentService },
                { provide: DeliveryService, useValue: deliveryService },
                { provide: DeluxeGuard, useValue: deluxeGuard },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderSummaryComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should log errors from address service directly to browser console', () => {
        addressService.getById.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log errors from payment service directly to browser console', () => {
        sessionStorage.setItem('paymentId', '1')
        paymentService.getById.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should hold address on ngOnInit', () => {
        addressService.getById.mockReturnValue(of({ address: 'address' }))
        component.ngOnInit()
        expect(component.address).toEqual({ address: 'address' })
    })

    it('should hold delivery price on ngOnInit', () => {
        deliveryService.getById.mockReturnValue(of({ price: 10 }))
        component.ngOnInit()
        expect(component.deliveryPrice).toEqual(10)
    })

    it('should hold card on ngOnInit when paymentId is initialized to an id', () => {
        sessionStorage.setItem('paymentId', '1')
        paymentService.getById.mockReturnValue(of({ cardNum: '************1234' }))
        component.ngOnInit()
        expect(component.paymentMethod).toEqual({ cardNum: '1234' })
    })

    it('should be wallet on ngOnInit when paymentId is initialized to wallet', () => {
        sessionStorage.setItem('paymentId', 'wallet')
        component.ngOnInit()
        expect(component.paymentMethod).toEqual('wallet')
    })

    it('should store prices on calling getMessage', () => {
        sessionStorage.setItem('couponDiscount', '70')
        component.getMessage([100, 1])
        expect(component.itemTotal).toBe(100)
        expect(component.promotionalDiscount).toBe(70)
        expect(component.bonus).toBe(1)
    })

    it('should remove session details from session storage', () => {
        basketService.checkout.mockReturnValue(of({ orderConfirmationId: '1234123412341234' }))
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
        component.placeOrder()
        expect(removeItemSpy).toHaveBeenCalledWith('paymentId')
        expect(removeItemSpy).toHaveBeenCalledWith('addressId')
        expect(removeItemSpy).toHaveBeenCalledWith('deliveryMethodId')
        expect(removeItemSpy).toHaveBeenCalledWith('couponDetails')
        expect(removeItemSpy).toHaveBeenCalledWith('couponDiscount')
    })
})
