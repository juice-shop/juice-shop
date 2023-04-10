/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { AddressCreateComponent } from './address-create.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { AddressService } from '../Services/address.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

describe('AddressCreateComponent', () => {
  let component: AddressCreateComponent
  let fixture: ComponentFixture<AddressCreateComponent>
  let addressService
  let translateService
  let snackBar: any

  beforeEach(waitForAsync(() => {
    addressService = jasmine.createSpyObj('AddressService', ['getById', 'put', 'save'])
    addressService.save.and.returnValue(of({}))
    addressService.getById.and.returnValue(of({}))
    addressService.put.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    snackBar.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,

        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatGridListModule,
        MatIconModule,
        MatSnackBarModule
      ],
      declarations: [AddressCreateComponent],
      providers: [
        { provide: AddressService, useValue: addressService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressCreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reinitizalise forms by calling resetForm', () => {
    component.countryControl.setValue('US')
    component.nameControl.setValue('jim')
    component.numberControl.setValue(9800000000)
    component.pinControl.setValue('NX 101')
    component.addressControl.setValue('Bakers Street')
    component.cityControl.setValue('NYC')
    component.stateControl.setValue('NY')
    component.resetForm()
    expect(component.countryControl.value).toBe('')
    expect(component.countryControl.pristine).toBe(true)
    expect(component.countryControl.untouched).toBe(true)
    expect(component.nameControl.value).toBe('')
    expect(component.nameControl.pristine).toBe(true)
    expect(component.nameControl.untouched).toBe(true)
    expect(component.numberControl.value).toBe('')
    expect(component.numberControl.pristine).toBe(true)
    expect(component.numberControl.untouched).toBe(true)
    expect(component.pinControl.value).toBe('')
    expect(component.pinControl.pristine).toBe(true)
    expect(component.pinControl.untouched).toBe(true)
    expect(component.addressControl.value).toBe('')
    expect(component.addressControl.pristine).toBe(true)
    expect(component.addressControl.untouched).toBe(true)
    expect(component.cityControl.value).toBe('')
    expect(component.cityControl.pristine).toBe(true)
    expect(component.cityControl.untouched).toBe(true)
    expect(component.stateControl.value).toBe('')
    expect(component.stateControl.pristine).toBe(true)
    expect(component.stateControl.untouched).toBe(true)
  })

  it('should be compulsory to provide country', () => {
    component.countryControl.setValue('')
    expect(component.countryControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide name', () => {
    component.nameControl.setValue('')
    expect(component.nameControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide number', () => {
    component.numberControl.setValue('')
    expect(component.numberControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide pin', () => {
    component.pinControl.setValue('')
    expect(component.pinControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide address', () => {
    component.addressControl.setValue('')
    expect(component.addressControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide city', () => {
    component.cityControl.setValue('')
    expect(component.cityControl.valid).toBeFalsy()
  })

  it('should not be compulsory to provide state', () => {
    component.stateControl.setValue('')
    expect(component.stateControl.valid).toBe(true)
  })

  it('pin code should not be more than 8 characters', () => {
    let str: string = ''
    for (let i = 0; i < 9; ++i) {
      str += 'a'
    }
    component.pinControl.setValue(str)
    expect(component.pinControl.valid).toBeFalsy()
    str = str.slice(1)
    component.pinControl.setValue(str)
    expect(component.pinControl.valid).toBe(true)
  })

  it('address should not be more than 160 characters', () => {
    let str: string = ''
    for (let i = 0; i < 161; ++i) {
      str += 'a'
    }
    component.addressControl.setValue(str)
    expect(component.addressControl.valid).toBeFalsy()
    str = str.slice(1)
    component.addressControl.setValue(str)
    expect(component.addressControl.valid).toBe(true)
  })

  it('number should be in the range [1111111, 9999999999]', () => {
    component.numberControl.setValue(1111110)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(10000000000)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(9999999999)
    expect(component.numberControl.valid).toBe(true)
    component.numberControl.setValue(1111111)
    expect(component.numberControl.valid).toBe(true)
  })

  it('should reset the form on updating address and show confirmation', () => {
    addressService.put.and.returnValue(of({ city: 'NY' }))
    translateService.get.and.returnValue(of('ADDRESS_UPDATED'))
    component.mode = 'edit'
    spyOn(component, 'resetForm')
    spyOn(component, 'ngOnInit')
    component.save()
    expect(translateService.get).toHaveBeenCalledWith('ADDRESS_UPDATED', { city: 'NY' })
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should reset the form on adding address and show confirmation', () => {
    addressService.save.and.returnValue(of({ city: 'NY' }))
    translateService.get.and.returnValue(of('ADDRESS_ADDED'))
    spyOn(component, 'resetForm')
    spyOn(component, 'ngOnInit')
    component.save()
    expect(translateService.get).toHaveBeenCalledWith('ADDRESS_ADDED', { city: 'NY' })
    expect(component.ngOnInit).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should clear the form and display error if saving address fails', fakeAsync(() => {
    addressService.save.and.returnValue(throwError({ error: 'Error' }))
    spyOn(component, 'resetForm')
    component.save()
    expect(component.resetForm).toHaveBeenCalled()
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should clear the form and display error if updating address fails', fakeAsync(() => {
    addressService.put.and.returnValue(throwError({ error: 'Error' }))
    component.mode = 'edit'
    spyOn(component, 'resetForm')
    component.save()
    expect(component.resetForm).toHaveBeenCalled()
    expect(snackBar.open).toHaveBeenCalled()
  }))

  it('should populate the form on calling initializeForm', () => {
    component.initializeForm({ country: 'US', fullName: 'jim', mobileNum: 9800000000, zipCode: 'NX 101', streetAddress: 'Bakers Street', city: 'NYC', state: 'NY' })
    expect(component.countryControl.value).toBe('US')
    expect(component.nameControl.value).toBe('jim')
    expect(component.numberControl.value).toBe(9800000000)
    expect(component.pinControl.value).toBe('NX 101')
    expect(component.addressControl.value).toBe('Bakers Street')
    expect(component.cityControl.value).toBe('NYC')
    expect(component.stateControl.value).toBe('NY')
  })
})
