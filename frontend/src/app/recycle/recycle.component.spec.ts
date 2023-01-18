/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { ConfigurationService } from '../Services/configuration.service'
import { UserService } from '../Services/user.service'
import { RecycleService } from '../Services/recycle.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'

import { RecycleComponent } from './recycle.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatNativeDateModule } from '@angular/material/core'
import { of, throwError } from 'rxjs'
import { AddressComponent } from '../address/address.component'
import { RouterTestingModule } from '@angular/router/testing'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatRadioModule } from '@angular/material/radio'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBar } from '@angular/material/snack-bar'

describe('RecycleComponent', () => {
  let component: RecycleComponent
  let fixture: ComponentFixture<RecycleComponent>
  let recycleService: any
  let userService: any
  let configurationService: any
  let translateService
  let snackBar: any

  beforeEach(waitForAsync(() => {
    recycleService = jasmine.createSpyObj('RecycleService', ['save', 'find'])
    recycleService.save.and.returnValue(of({}))
    recycleService.find.and.returnValue(of([{}]))
    userService = jasmine.createSpyObj('UserService', ['whoAmI'])
    userService.whoAmI.and.returnValue(of({}))
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatToolbarModule,
        MatTableModule,
        MatRadioModule,
        MatTooltipModule,
        MatDialogModule,
        MatDividerModule
      ],
      declarations: [RecycleComponent, AddressComponent],
      providers: [
        { provide: RecycleService, useValue: recycleService },
        { provide: UserService, useValue: userService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RecycleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reset the form by calling resetForm', () => {
    component.addressId = '1'
    component.recycleQuantityControl.setValue('100')
    component.pickUpDateControl.setValue('10/7/2018')
    component.pickup.setValue(true)
    component.resetForm()
    expect(component.addressId).toBeUndefined()
    expect(component.recycleQuantityControl.value).toBe('')
    expect(component.recycleQuantityControl.untouched).toBe(true)
    expect(component.recycleQuantityControl.pristine).toBe(true)
    expect(component.pickUpDateControl.value).toBe('')
    expect(component.pickUpDateControl.untouched).toBe(true)
    expect(component.pickUpDateControl.pristine).toBe(true)
    expect(component.pickup.value).toBe(false)
  })

  it('should hold the user id of the currently logged in user', () => {
    userService.whoAmI.and.returnValue(of({ id: 42 }))
    component.ngOnInit()
    expect(component.recycle.UserId).toBe(42)
  })

  it('should hold no email if current user is not logged in', () => {
    userService.whoAmI.and.returnValue(of({}))
    component.ngOnInit()
    expect(component.userEmail).toBeUndefined()
  })

  it('should hold the user email of the currently logged in user', () => {
    userService.whoAmI.and.returnValue(of({ email: 'x@x.xx' }))
    component.ngOnInit()
    expect(component.userEmail).toBe('x@x.xx')
  })

  it('should display pickup message and reset recycle form on saving', () => {
    recycleService.save.and.returnValue(of({}))
    userService.whoAmI.and.returnValue(of({}))
    translateService.get.and.returnValue(of('CONFIRM_RECYCLING_BOX'))
    spyOn(component, 'initRecycle')
    spyOn(component.addressComponent, 'load')
    component.addressId = '1'
    component.recycleQuantityControl.setValue(100)
    component.pickup.setValue(false)
    const recycle = { UserId: undefined, AddressId: '1', quantity: 100 }
    component.save()
    expect(recycleService.save.calls.count()).toBe(1)
    expect(recycleService.save.calls.argsFor(0)[0]).toEqual(recycle)
    expect(component.initRecycle).toHaveBeenCalled()
    expect(component.addressComponent.load).toHaveBeenCalled()
    expect(translateService.get).toHaveBeenCalledWith('CONFIRM_RECYCLING_BOX')
  })

  it('should display pickup message and reset recycle form on saving when pickup is selected', () => {
    recycleService.save.and.returnValue(of({ isPickup: true, pickupDate: '10/7/2018' }))
    userService.whoAmI.and.returnValue(of({}))
    translateService.get.and.returnValue(of('CONFIRM_RECYCLING_PICKUP'))
    spyOn(component, 'initRecycle')
    spyOn(component.addressComponent, 'load')
    component.addressId = '1'
    component.recycleQuantityControl.setValue(100)
    component.pickup.setValue(true)
    component.pickUpDateControl.setValue('10/7/2018')
    const recycle = { isPickUp: true, date: '10/7/2018', UserId: undefined, AddressId: '1', quantity: 100 }
    component.save()
    expect(recycleService.save.calls.count()).toBe(1)
    expect(recycleService.save.calls.argsFor(0)[0]).toEqual(recycle)
    expect(component.initRecycle).toHaveBeenCalled()
    expect(component.addressComponent.load).toHaveBeenCalled()
    expect(translateService.get).toHaveBeenCalledWith('CONFIRM_RECYCLING_PICKUP', { pickupdate: '10/7/2018' })
  })

  it('should hold existing recycles', () => {
    recycleService.find.and.returnValue(of([{ quantity: 1 }, { quantity: 2 }]))
    component.ngOnInit()
    expect(component.recycles.length).toBe(2)
    expect(component.recycles[0].quantity).toBe(1)
    expect(component.recycles[1].quantity).toBe(2)
  })

  it('should hold nothing when no recycles exists', () => {
    recycleService.find.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.recycles.length).toBe(0)
  })

  it('should hold nothing on error from backend API', () => {
    recycleService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  })

  it('should log the error on retrieving the user', fakeAsync(() => {
    userService.whoAmI.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should use a configured product image on top of page', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { recyclePage: { topProductImage: 'top.png' } } }))
    component.ngOnInit()
    expect(component.topImage).toEqual('assets/public/images/products/top.png')
  })

  it('should use a configured product image on bottom of page', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { recyclePage: { topProductImage: 'bottom.png' } } }))
    component.ngOnInit()
    expect(component.topImage).toEqual('assets/public/images/products/bottom.png')
  })

  it('should show broken top and bottom image on error retrieving configuration', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.topImage).toBeUndefined()
    expect(component.bottomImage).toBeUndefined()
  }))
})
