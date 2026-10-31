/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { AddressCreateComponent } from './address-create.component'
import { MatInputModule } from '@angular/material/input'

import { Location } from '@angular/common'
import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { convertToParamMap } from '@angular/router'
import { AddressService } from '../Services/address.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AddressCreateComponent', () => {
    let component: AddressCreateComponent
    let fixture: ComponentFixture<AddressCreateComponent>
    let addressService
    let translateService
    let snackBar: any

    const setModel = (values: Partial<ReturnType<AddressCreateComponent['addressModel']>>) => {
        component.addressModel.update((model) => ({ ...model, ...values }))
    }

    const submitForm = async () => {
        const form = (fixture.nativeElement as HTMLElement).querySelector('#address-form') as HTMLFormElement
        form.dispatchEvent(new Event('submit'))
        await fixture.whenStable()
        fixture.detectChanges()
    }

    const completeAddress = {
        country: 'US',
        fullName: 'Jim Doe',
        mobileNum: 9800000000,
        zipCode: '10001',
        streetAddress: '123 Main St',
        city: 'NYC',
        state: 'NY'
    }

    beforeEach(async () => {
        addressService = {
            getById: vi.fn().mockName("AddressService.getById"),
            put: vi.fn().mockName("AddressService.put"),
            save: vi.fn().mockName("AddressService.save")
        }
        addressService.save.mockReturnValue(of({}))
        addressService.getById.mockReturnValue(of({}))
        addressService.put.mockReturnValue(of({}))
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
            imports: [RouterTestingModule,
                TranslateModule.forRoot(),
                MatCardModule,
                MatFormFieldModule,
                MatInputModule,
                MatGridListModule,
                MatIconModule,
                MatSnackBarModule,
                AddressCreateComponent],
            providers: [
                { provide: AddressService, useValue: addressService },
                { provide: TranslateService, useValue: translateService },
                { provide: MatSnackBar, useValue: snackBar },
                SnackBarHelperService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(AddressCreateComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize form in edit mode when addressId route param is present', () => {
        addressService.getById.mockReturnValue(of(completeAddress))
        vi.spyOn(component.activatedRoute, 'paramMap', 'get').mockReturnValue(of(convertToParamMap({ addressId: '42' })))
        component.ngOnInit()

        expect(component.mode).toBe('edit')
        expect(component.addressModel().country).toBe('US')
        expect(component.addressModel().fullName).toBe('Jim Doe')
        expect(component.addressModel().city).toBe('NYC')
    })

    it('should reinitizalise forms by calling resetForm', () => {
        setModel({ ...completeAddress })
        component.addressForm.country().markAsDirty()
        component.addressForm.country().markAsTouched()
        component.resetForm()
        expect(component.addressModel().country).toBe('')
        expect(component.addressForm.country().dirty()).toBe(false)
        expect(component.addressForm.country().touched()).toBe(false)
        expect(component.addressModel().fullName).toBe('')
        expect(component.addressForm.fullName().dirty()).toBe(false)
        expect(component.addressForm.fullName().touched()).toBe(false)
        expect(component.addressModel().mobileNum).toBeNull()
        expect(component.addressForm.mobileNum().dirty()).toBe(false)
        expect(component.addressForm.mobileNum().touched()).toBe(false)
        expect(component.addressModel().zipCode).toBe('')
        expect(component.addressForm.zipCode().dirty()).toBe(false)
        expect(component.addressForm.zipCode().touched()).toBe(false)
        expect(component.addressModel().streetAddress).toBe('')
        expect(component.addressForm.streetAddress().dirty()).toBe(false)
        expect(component.addressForm.streetAddress().touched()).toBe(false)
        expect(component.addressModel().city).toBe('')
        expect(component.addressForm.city().dirty()).toBe(false)
        expect(component.addressForm.city().touched()).toBe(false)
        expect(component.addressModel().state).toBe('')
        expect(component.addressForm.state().dirty()).toBe(false)
        expect(component.addressForm.state().touched()).toBe(false)
    })

    it('should be compulsory to provide country', () => {
        setModel({ country: '' })
        expect(component.addressForm.country().valid()).toBeFalsy()
        setModel({ country: 'US' })
        expect(component.addressForm.country().valid()).toBe(true)
    })

    it('should be compulsory to provide name', () => {
        setModel({ fullName: '' })
        expect(component.addressForm.fullName().valid()).toBeFalsy()
        setModel({ fullName: 'Jim Doe' })
        expect(component.addressForm.fullName().valid()).toBe(true)
    })

    it('should be compulsory to provide number', () => {
        setModel({ mobileNum: null })
        expect(component.addressForm.mobileNum().valid()).toBeFalsy()
        setModel({ mobileNum: 9800000000 })
        expect(component.addressForm.mobileNum().valid()).toBe(true)
    })

    it('should be compulsory to provide pin', () => {
        setModel({ zipCode: '' })
        expect(component.addressForm.zipCode().valid()).toBeFalsy()
        setModel({ zipCode: '10001' })
        expect(component.addressForm.zipCode().valid()).toBe(true)
    })

    it('should be compulsory to provide address', () => {
        setModel({ streetAddress: '' })
        expect(component.addressForm.streetAddress().valid()).toBeFalsy()
        setModel({ streetAddress: 'Bakers Street' })
        expect(component.addressForm.streetAddress().valid()).toBe(true)
    })

    it('should be compulsory to provide city', () => {
        setModel({ city: '' })
        expect(component.addressForm.city().valid()).toBeFalsy()
        setModel({ city: 'NYC' })
        expect(component.addressForm.city().valid()).toBe(true)
    })

    it('should not be compulsory to provide state', () => {
        setModel({ state: '' })
        expect(component.addressForm.state().valid()).toBe(true)
    })

    it('pin code should not be more than 8 characters', () => {
        let str = ''
        for (let i = 0; i < 9; ++i) {
            str += 'a'
        }
        setModel({ zipCode: str })
        expect(component.addressForm.zipCode().valid()).toBeFalsy()
        str = str.slice(1)
        setModel({ zipCode: str })
        expect(component.addressForm.zipCode().valid()).toBe(true)
    })

    it('address should not be more than 160 characters', () => {
        let str = ''
        for (let i = 0; i < 161; ++i) {
            str += 'a'
        }
        setModel({ streetAddress: str })
        expect(component.addressForm.streetAddress().valid()).toBeFalsy()
        str = str.slice(1)
        setModel({ streetAddress: str })
        expect(component.addressForm.streetAddress().valid()).toBe(true)
    })

    it('number should be in the range [1111111, 9999999999]', () => {
        setModel({ mobileNum: 1111110 })
        expect(component.addressForm.mobileNum().valid()).toBeFalsy()
        setModel({ mobileNum: 10000000000 })
        expect(component.addressForm.mobileNum().valid()).toBeFalsy()
        setModel({ mobileNum: 9999999999 })
        expect(component.addressForm.mobileNum().valid()).toBe(true)
        setModel({ mobileNum: 1111111 })
        expect(component.addressForm.mobileNum().valid()).toBe(true)
    })

    it('should pass the range parameter when translating INVALID_MOBILE_NUMBER', async () => {
        setModel({ mobileNum: 100 })
        await submitForm()
        expect(translateService.get).toHaveBeenCalledWith('INVALID_MOBILE_NUMBER', { range: '1000000-9999999999' })
        expect(addressService.save).not.toHaveBeenCalled()
    })

    it('should disable the submit button until all mandatory fields are filled', async () => {
        const submitButton = () => (fixture.nativeElement as HTMLElement).querySelector('#submitButton') as HTMLButtonElement
        expect(submitButton().disabled).toBe(true)
        setModel({ ...completeAddress })
        await fixture.whenStable()
        fixture.detectChanges()
        expect(submitButton().disabled).toBe(false)
    })

    it('should update the address model from the native form controls', async () => {
        const nativeElement = fixture.nativeElement as HTMLElement
        const inputs = nativeElement.querySelectorAll('input')
        const textarea = nativeElement.querySelector('textarea') as HTMLTextAreaElement
        const typeInto = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
            field.value = value
            field.dispatchEvent(new Event('input'))
        }
        typeInto(inputs[0], 'US')
        typeInto(inputs[1], 'Jim Doe')
        typeInto(inputs[2], '9800000000')
        typeInto(inputs[3], '10001')
        typeInto(textarea, '123 Main St')
        typeInto(inputs[4], 'NYC')
        typeInto(inputs[5], 'NY')
        await fixture.whenStable()

        expect(component.addressModel()).toEqual(completeAddress)
        expect(component.addressForm().valid()).toBe(true)
    })

    it('should save the address when the form is submitted', async () => {
        setModel({ ...completeAddress })
        await submitForm()
        expect(addressService.save).toHaveBeenCalledWith(completeAddress)
    })

    it('should navigate back to the previous page after saving the address', async () => {
        const back = vi.spyOn(TestBed.inject(Location), 'back')
        addressService.save.mockReturnValue(of({ city: 'NYC' }))
        await component.save()
        expect(back).toHaveBeenCalled()
    })

    it('should reset the form on updating address and show confirmation', async () => {
        addressService.put.mockReturnValue(of({ city: 'NY' }))
        translateService.get.mockReturnValue(of('ADDRESS_UPDATED'))
        component.mode = 'edit'
        vi.spyOn(component, 'resetForm')
        await component.save()
        expect(translateService.get).toHaveBeenCalledWith('ADDRESS_UPDATED', { city: 'NY' })
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should reset the form on adding address and show confirmation', async () => {
        addressService.save.mockReturnValue(of({ city: 'NY' }))
        translateService.get.mockReturnValue(of('ADDRESS_ADDED'))
        vi.spyOn(component, 'resetForm')
        await component.save()
        expect(translateService.get).toHaveBeenCalledWith('ADDRESS_ADDED', { city: 'NY' })
        expect(component.resetForm).toHaveBeenCalled()
    })

    it('should clear the form and display error if saving address fails', async () => {
        addressService.save.mockReturnValue(throwError({ error: 'Error' }))
        vi.spyOn(component, 'resetForm')
        await component.save()
        expect(component.resetForm).toHaveBeenCalled()
        expect(snackBar.open).toHaveBeenCalled()
    })

    it('should clear the form and display error if updating address fails', async () => {
        addressService.put.mockReturnValue(throwError({ error: 'Error' }))
        component.mode = 'edit'
        vi.spyOn(component, 'resetForm')
        await component.save()
        expect(component.resetForm).toHaveBeenCalled()
        expect(snackBar.open).toHaveBeenCalled()
    })

    it('should populate the form on calling initializeForm', () => {
        component.initializeForm({ country: 'US', fullName: 'jim', mobileNum: 9800000000, zipCode: 'NX 101', streetAddress: 'Bakers Street', city: 'NYC', state: 'NY' })
        expect(component.addressModel().country).toBe('US')
        expect(component.addressModel().fullName).toBe('jim')
        expect(component.addressModel().mobileNum).toBe(9800000000)
        expect(component.addressModel().zipCode).toBe('NX 101')
        expect(component.addressModel().streetAddress).toBe('Bakers Street')
        expect(component.addressModel().city).toBe('NYC')
        expect(component.addressModel().state).toBe('NY')
    })

    it('should show snackbar error when translation fails after address creation', async () => {
        const snackBarHelperService = TestBed.inject(SnackBarHelperService)
        const spy = vi.spyOn(snackBarHelperService, 'open')
        addressService.save.mockReturnValue(of({ city: 'NYC' }))
        translateService.get.mockReturnValue(throwError('ADDRESS_ADDED'))
        await component.save()
        expect(spy).toHaveBeenCalledWith('ADDRESS_ADDED', 'confirmBar')
    })

    it('should show snackbar error when translation fails after address update', async () => {
        const snackBarHelperService = TestBed.inject(SnackBarHelperService)
        const spy = vi.spyOn(snackBarHelperService, 'open')
        component.mode = 'edit'
        addressService.put.mockReturnValue(of({ city: 'NYC' }))
        translateService.get.mockReturnValue(throwError('ADDRESS_UPDATED'))
        await component.save()
        expect(spy).toHaveBeenCalledWith('ADDRESS_UPDATED', 'confirmBar')
    })

    it('should show snackbar error and clear form when address creation fails', async () => {
        const snackBarHelperService = TestBed.inject(SnackBarHelperService)
        const spy = vi.spyOn(snackBarHelperService, 'open')
        addressService.save.mockReturnValue(throwError({ error: { error: 'Save failed' } }))
        vi.spyOn(component, 'resetForm')
        await component.save()
        expect(spy).toHaveBeenCalledWith('Save failed', 'errorBar')
        expect(component.resetForm).toHaveBeenCalled()
    })
})
