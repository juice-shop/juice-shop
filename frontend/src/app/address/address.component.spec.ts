/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { AddressComponent } from './address.component'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

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

describe('AddressComponent', () => {
  let component: AddressComponent
  let fixture: ComponentFixture<AddressComponent>
  let addressService
  let snackBar: any
  let translateService

  beforeEach(waitForAsync(() => {
    addressService = jasmine.createSpyObj('AddressService', ['get', 'del'])
    addressService.get.and.returnValue(of([]))
    addressService.del.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    snackBar.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'delivery-method', component: DeliveryMethodComponent }
        ]),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,

        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatDividerModule,
        MatRadioModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule
      ],
      declarations: [AddressComponent, AddressCreateComponent],
      providers: [
        { provide: AddressService, useValue: addressService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold no addresses when get API call fails', () => {
    addressService.get.and.returnValue(throwError('Error'))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.storedAddresses).toEqual([])
  })

  it('should log error from get address API call directly to browser console', fakeAsync(() => {
    addressService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log error from delete address API call directly to browser console', fakeAsync(() => {
    addressService.del.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.deleteAddress(1)
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should delete an address on calling deleteAddress', fakeAsync(() => {
    addressService.get.and.returnValue(of([]))
    addressService.del.and.returnValue(of([]))
    component.deleteAddress(1)
    spyOn(component, 'load')
    expect(addressService.del).toHaveBeenCalled()
    expect(addressService.get).toHaveBeenCalled()
  }))

  it('should store address id in session storage', () => {
    component.addressId = 1
    spyOn(sessionStorage, 'setItem')
    component.chooseAddress()
    expect(sessionStorage.setItem).toHaveBeenCalledWith('addressId', 1 as any)
  })
})
