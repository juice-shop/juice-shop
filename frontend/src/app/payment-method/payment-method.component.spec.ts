/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { of, throwError } from 'rxjs'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { PaymentService } from '../Services/payment.service'
import { MatDialogModule } from '@angular/material/dialog'
import { PaymentMethodComponent } from './payment-method.component'
import { EventEmitter } from '@angular/core'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

describe('PaymentMethodComponent', () => {
  let component: PaymentMethodComponent
  let fixture: ComponentFixture<PaymentMethodComponent>
  let paymentService
  let translateService
  let snackBar: any

  beforeEach(async(() => {

    paymentService = jasmine.createSpyObj('BasketService', ['save','get','del'])
    paymentService.save.and.returnValue(of([]))
    paymentService.get.and.returnValue(of([]))
    paymentService.del.and.returnValue(of([]))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    snackBar = jasmine.createSpyObj('MatSnackBar',['open'])

    TestBed.configureTestingModule({
      imports: [
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
        MatDialogModule
      ],
      declarations: [ PaymentMethodComponent ],
      providers: [
        { provide: PaymentService, useValue: paymentService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold cards returned by backend API', () => {
    paymentService.get.and.returnValue(of([{ cardNum: '************1231' }, { cardNum: '************6454' }]))
    component.load()
    expect(component.storedCards.length).toBe(2)
    expect(component.storedCards[0].cardNum).toBe('************1231')
    expect(component.storedCards[1].cardNum).toBe('************6454')
  })

  it('should hold no cards on error in backend API', fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    component.load()
    expect(component.storedCards.length).toBe(0)
  }))

  it('should hold no cards when none are returned by backend API', () => {
    paymentService.get.and.returnValue(of([]))
    component.load()
    expect(component.storedCards).toEqual([])
  })

  it('should log error while getting Cards from backend API directly to browser console' , fakeAsync(() => {
    paymentService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.load()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should reinitizalise new payment method form by calling resetForm', () => {
    component.nameControl.setValue('jim')
    component.numberControl.setValue(9999999999999999)
    component.monthControl.setValue(12)
    component.yearControl.setValue(2085)
    component.resetForm()
    expect(component.nameControl.value).toBe('')
    expect(component.nameControl.pristine).toBe(true)
    expect(component.nameControl.untouched).toBe(true)
    expect(component.numberControl.value).toBe('')
    expect(component.numberControl.pristine).toBe(true)
    expect(component.numberControl.untouched).toBe(true)
    expect(component.monthControl.value).toBe('')
    expect(component.monthControl.pristine).toBe(true)
    expect(component.monthControl.untouched).toBe(true)
    expect(component.yearControl.value).toBe('')
    expect(component.yearControl.pristine).toBe(true)
    expect(component.yearControl.untouched).toBe(true)
  })

  it('should be compulsory to provide name', () => {
    component.nameControl.setValue('')
    expect(component.nameControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide card number', () => {
    component.numberControl.setValue('')
    expect(component.numberControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide month', () => {
    component.monthControl.setValue('')
    expect(component.monthControl.valid).toBeFalsy()
  })

  it('should be compulsory to provide year', () => {
    component.yearControl.setValue('')
    expect(component.yearControl.valid).toBeFalsy()
  })

  it('card number should be in the range [1000000000000000, 9999999999999999]', () => {
    component.numberControl.setValue(1111110)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(99999999999999999)
    expect(component.numberControl.valid).toBeFalsy()
    component.numberControl.setValue(9999999999999999)
    expect(component.numberControl.valid).toBe(true)
    component.numberControl.setValue(1234567887654321)
    expect(component.numberControl.valid).toBe(true)
  })

  it('should reset the form on saving card and show confirmation', () => {
    paymentService.get.and.returnValue(of([]))
    paymentService.save.and.returnValue(of({ cardNum: '1234' }))
    translateService.get.and.returnValue(of('CREDIT_CARD_SAVED'))
    spyOn(component,'resetForm')
    spyOn(component,'load')
    component.save()
    expect(translateService.get).toHaveBeenCalledWith('CREDIT_CARD_SAVED',{ cardnumber: '1234' })
    expect(component.load).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should clear the form and display error if saving card fails', fakeAsync(() => {
    paymentService.save.and.returnValue(throwError({ error: 'Error' }))
    spyOn(component,'resetForm')
    component.save()
    expect(snackBar.open).toHaveBeenCalled()
    expect(component.resetForm).toHaveBeenCalled()
  }))
})
