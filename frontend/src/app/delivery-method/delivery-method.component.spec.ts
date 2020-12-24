/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
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

describe('DeliveryMethodComponent', () => {
  let component: DeliveryMethodComponent
  let fixture: ComponentFixture<DeliveryMethodComponent>
  let addressService: any
  let deliveryService: any

  beforeEach(waitForAsync(() => {

    addressService = jasmine.createSpyObj('AddressService',['getById'])
    addressService.getById.and.returnValue(of([]))
    deliveryService = jasmine.createSpyObj('DeliveryService', ['get'])
    deliveryService.get.and.returnValue(of([]))

    TestBed.configureTestingModule({
      declarations: [ DeliveryMethodComponent, PaymentComponent, PaymentMethodComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'payment/shop', component: PaymentComponent }
        ]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
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
        MatDividerModule
      ],
      providers: [
        { provide: AddressService, useValue: addressService },
        { provide: DeliveryService, useValue: deliveryService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryMethodComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should log errors from address service directly to browser console', fakeAsync(() => {
    addressService.getById.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log errors from delivery service directly to browser console', fakeAsync(() => {
    deliveryService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold address on ngOnInit', () => {
    addressService.getById.and.returnValue(of({ address: 'address' }))
    component.ngOnInit()
    expect(component.address).toEqual({ address: 'address' })
  })

  it('should hold delivery methods on ngOnInit', () => {
    deliveryService.get.and.returnValue(of([{ id: 1, name: '1', price: 1, eta: 1, icon: '1' }]))
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
    spyOn(sessionStorage,'setItem')
    component.chooseDeliveryMethod()
    expect(sessionStorage.setItem).toHaveBeenCalledWith('deliveryMethodId', '1')
  })
})
