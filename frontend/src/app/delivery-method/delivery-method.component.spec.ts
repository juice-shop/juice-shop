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
import { RouterTestingModule } from '@angular/router/testing'
import { AddressService } from '../Services/address.service'
import { of } from 'rxjs/internal/observable/of'
import { throwError } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DeliveryService } from '../Services/delivery.service'
import { DeliveryMethodComponent } from './delivery-method.component'
import { PaymentComponent } from '../payment/payment.component'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { MatRadioModule } from '@angular/material/radio'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('DeliveryMethodComponent', () => {
    let component: DeliveryMethodComponent
    let fixture: ComponentFixture<DeliveryMethodComponent>
    let addressService: any
    let deliveryService: any

    beforeEach(async () => {
        addressService = {
            getById: vi.fn().mockName("AddressService.getById")
        }
        addressService.getById.mockReturnValue(of([]))
        deliveryService = {
            get: vi.fn().mockName("DeliveryService.get")
        }
        deliveryService.get.mockReturnValue(of([]))

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'payment/shop', component: PaymentComponent }
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
                MatRadioModule,
                MatExpansionModule,
                MatDividerModule,
                DeliveryMethodComponent, PaymentComponent, PaymentMethodComponent],
            providers: [
                { provide: AddressService, useValue: addressService },
                { provide: DeliveryService, useValue: deliveryService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(DeliveryMethodComponent)
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

    it('should log errors from delivery service directly to browser console', () => {
        deliveryService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should hold address on ngOnInit', () => {
        addressService.getById.mockReturnValue(of({ address: 'address' }))
        component.ngOnInit()
        expect(component.address).toEqual({ address: 'address' })
    })

    it('should hold delivery methods on ngOnInit', () => {
        deliveryService.get.mockReturnValue(of([{ id: 1, name: '1', price: 1, eta: 1, icon: '1' }]))
        component.ngOnInit()
        expect(component.methods[0].id).toEqual(1)
        expect(component.methods[0].name).toEqual('1')
        expect(component.methods[0].price).toEqual(1)
        expect(component.methods[0].eta).toEqual(1)
        expect(component.methods[0].icon).toEqual('1')
    })

    it('should store delivery method id on selectMethod', () => {
        component.selectMethod(1)
        expect(component.deliveryMethodId).toBe(1)
    })

    it('should store address id in session storage', () => {
        component.deliveryMethodId = 1
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.chooseDeliveryMethod()
        expect(setItemSpy).toHaveBeenCalledWith('deliveryMethodId', '1')
    })

    describe('template rendering', () => {
        const renderWith = (methods: any[], address: any = null) => {
            deliveryService.get.mockReturnValue(of(methods))
            addressService.getById.mockReturnValue(address ? of(address) : of([]))
            const f = TestBed.createComponent(DeliveryMethodComponent)
            f.detectChanges()
            return f
        }

        it('should not render the delivery address section when there is no address', () => {
            addressService.getById.mockReturnValue(of(null))
            const f = TestBed.createComponent(DeliveryMethodComponent)
            f.detectChanges()
            expect(f.nativeElement.querySelector('.addressCont')).toBeNull()
        })

        it('should render the delivery address section with all address fields when an address is loaded', () => {
            const f = renderWith([], {
                fullName: 'Alice', streetAddress: 'Main 1', city: 'C', state: 'ST', zipCode: 'Z', country: 'CO', mobileNum: '12345'
            })
            const text = (f.nativeElement as HTMLElement).textContent ?? ''
            expect(f.nativeElement.querySelector('.addressCont')).toBeTruthy()
            expect(text).toContain('Alice')
            expect(text).toContain('Main 1')
            expect(text).toContain('CO')
            expect(text).toContain('12345')
        })

        it('should render one delivery row per delivery method with price formatted with two decimals', () => {
            const f = renderWith([
                { id: 1, name: 'Standard', price: 1, eta: 3, icon: 'i1' },
                { id: 2, name: 'Express', price: 5.5, eta: 1, icon: 'i2' }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelectorAll('mat-row').length).toBe(2)
            const text = compiled.textContent ?? ''
            expect(text).toContain('Standard')
            expect(text).toContain('Express')
            expect(text).toContain('1.00')
            expect(text).toContain('5.50')
        })

        it('should disable the continue button when no delivery method is selected and enable it after a selection', () => {
            const f = renderWith([{ id: 1, name: 'Standard', price: 1, eta: 3, icon: 'i1' }])
            const next = f.nativeElement.querySelector('button.nextButton') as HTMLButtonElement
            expect(next.disabled).toBe(true)

            f.componentInstance.deliveryMethodId = 1
            f.detectChanges()
            expect((f.nativeElement.querySelector('button.nextButton') as HTMLButtonElement).disabled).toBe(false)
        })

        it('should wire the back and continue buttons to their respective component methods', () => {
            const f = renderWith([{ id: 1, name: 'Standard', price: 1, eta: 3, icon: 'i1' }])
            f.componentInstance.deliveryMethodId = 1
            f.detectChanges()
            const backSpy = vi.spyOn(f.componentInstance, 'routeToPreviousUrl').mockImplementation(() => { })
            const chooseSpy = vi.spyOn(f.componentInstance, 'chooseDeliveryMethod').mockImplementation(() => { })

            ;(f.nativeElement.querySelector('button.btn-return') as HTMLButtonElement).click()
            ;(f.nativeElement.querySelector('button.nextButton') as HTMLButtonElement).click()

            expect(backSpy).toHaveBeenCalled()
            expect(chooseSpy).toHaveBeenCalled()
        })
    })
})
