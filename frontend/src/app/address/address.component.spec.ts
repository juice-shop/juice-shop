/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { AddressComponent } from './address.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'

import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { AddressService } from '../Services/address.service'
import { AddressCreateComponent } from '../address-create/address-create.component'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter } from '@angular/core'
import { DeliveryMethodComponent } from '../delivery-method/delivery-method.component'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AddressComponent', () => {
    let component: AddressComponent
    let fixture: ComponentFixture<AddressComponent>
    let addressService
    let snackBar: any
    let translateService

    beforeEach(async () => {
        addressService = {
            get: vi.fn().mockName("AddressService.get"),
            del: vi.fn().mockName("AddressService.del")
        }
        addressService.get.mockReturnValue(of([]))
        addressService.del.mockReturnValue(of({}))
        translateService = {
            get: vi.fn().mockName("TranslateService.get")
        }
        translateService.get.mockReturnValue(of({}))
        translateService.onLangChange = new EventEmitter()
        translateService.onTranslationChange = new EventEmitter()
        translateService.onFallbackLangChange = new EventEmitter()
        translateService.onDefaultLangChange = new EventEmitter()
        snackBar = {
            open: vi.fn().mockName("MatSnackBar.open")
        }
        snackBar.open.mockReturnValue(null)

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
                    { path: 'delivery-method', component: DeliveryMethodComponent }
                ]),
                TranslateModule.forRoot(),
                ReactiveFormsModule,
                MatCardModule,
                MatTableModule,
                MatFormFieldModule,
                MatInputModule,
                MatExpansionModule,
                MatDividerModule,
                MatRadioModule,
                MatDialogModule,
                MatIconModule,
                MatTooltipModule,
                AddressComponent, AddressCreateComponent],
            providers: [
                { provide: AddressService, useValue: addressService },
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(AddressComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should hold no addresses when get API call fails', () => {
        addressService.get.mockReturnValue(throwError('Error'))
        component.ngOnInit()
        fixture.detectChanges()
        expect(component.storedAddresses).toEqual([])
    })

    it('should log error from get address API call directly to browser console', () => {
        addressService.get.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.ngOnInit()
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should log error from delete address API call directly to browser console', () => {
        addressService.del.mockReturnValue(throwError('Error'))
        console.log = vi.fn()
        component.deleteAddress(1)
        fixture.detectChanges()
        expect(console.log).toHaveBeenCalledWith('Error')
    })

    it('should delete an address on calling deleteAddress', () => {
        addressService.get.mockReturnValue(of([]))
        addressService.del.mockReturnValue(of([]))
        component.deleteAddress(1)
        vi.spyOn(component, 'load')
        expect(addressService.del).toHaveBeenCalled()
        expect(addressService.get).toHaveBeenCalled()
    })

    it('should store address id in session storage', () => {
        component.addressId = 1
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        component.chooseAddress()
        expect(setItemSpy).toHaveBeenCalledWith('addressId', 1 as any)
    })

    describe('template rendering', () => {
        const renderWith = (addresses: any[], inputs: Partial<AddressComponent> = {}) => {
            addressService.get.mockReturnValue(of(addresses))
            const f = TestBed.createComponent(AddressComponent)
            Object.assign(f.componentInstance, inputs)
            f.detectChanges()
            return f
        }

        it('should render the saved-addresses title by default and the select title when showNextButton is true', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('h1')).toBeTruthy()

            const f = renderWith([], { showNextButton: true })
            expect(f.nativeElement.querySelector('h1')).toBeTruthy()
            expect(f.nativeElement.querySelector('button.btn-next')).toBeTruthy()
        })

        it('should not render the address table when there are no stored addresses', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('mat-table.address-table')).toBeNull()
        })

        it('should render the address table with a row per stored address when addresses exist', () => {
            const f = renderWith([
                { id: 1, fullName: 'Alice', streetAddress: 'S1', city: 'C1', state: 'ST', zipCode: 'Z1', country: 'CO' },
                { id: 2, fullName: 'Bob', streetAddress: 'S2', city: 'C2', state: 'ST', zipCode: 'Z2', country: 'CO' }
            ])
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('mat-table.address-table')).toBeTruthy()
            expect(compiled.querySelectorAll('mat-row').length).toBe(2)
            expect(compiled.textContent).toContain('Alice')
            expect(compiled.textContent).toContain('Bob')
        })

        it('should render the add-new-address button by default and hide it when addNewAddressDiv is false', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('button.btn-new-address')).toBeTruthy()

            const f = renderWith([], { addNewAddressDiv: false })
            expect(f.nativeElement.querySelector('button.btn-new-address')).toBeNull()
        })

        it('should disable the next button when no address is selected and enable it when an address id is set', () => {
            const f = renderWith([], { showNextButton: true })
            const next = f.nativeElement.querySelector('button.btn-next') as HTMLButtonElement
            expect(next.disabled).toBe(true)

            f.componentInstance.addressId = 5
            f.detectChanges()
            expect((f.nativeElement.querySelector('button.btn-next') as HTMLButtonElement).disabled).toBe(false)
        })

        it('should invoke chooseAddress when the next button is clicked', () => {
            const f = renderWith([], { showNextButton: true })
            f.componentInstance.addressId = 1
            f.detectChanges()
            const spy = vi.spyOn(f.componentInstance, 'chooseAddress').mockImplementation(() => { })
            const next = f.nativeElement.querySelector('button.btn-next') as HTMLButtonElement
            next.click()
            expect(spy).toHaveBeenCalled()
        })

        it('should render edit and remove buttons per row only when allowEdit is true', () => {
            const f = renderWith(
                [{ id: 1, fullName: 'Alice', streetAddress: 'S1', city: 'C1', state: 'ST', zipCode: 'Z1', country: 'CO' }],
                { allowEdit: true }
            )
            const compiled: HTMLElement = f.nativeElement
            expect(compiled.querySelector('button [class*="fa-edit"]')).toBeTruthy()
            expect(compiled.querySelector('button [class*="fa-trash-alt"]')).toBeTruthy()
        })
    })
})
