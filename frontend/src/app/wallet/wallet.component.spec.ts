/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { of, throwError } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { WalletComponent } from './wallet.component'
import { WalletService } from '../Services/wallet.service'
import { EventEmitter } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'

describe('WalletComponent', () => {
  let component: WalletComponent
  let fixture: ComponentFixture<WalletComponent>
  let walletService
  let translateService
  let snackBar: any

  beforeEach(waitForAsync(() => {
    walletService = jasmine.createSpyObj('AddressService', ['get', 'put'])
    walletService.get.and.returnValue(of({}))
    walletService.put.and.returnValue(of({}))
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
        ReactiveFormsModule,

        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatGridListModule
      ],
      declarations: [WalletComponent],
      providers: [
        { provide: WalletService, useValue: walletService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should be compulsory to provide amount', () => {
    component.balanceControl.setValue('')
    expect(component.balanceControl.valid).toBeFalsy()
  })

  it('amount should be in the range [10, 1000]', () => {
    component.balanceControl.setValue(-1)
    expect(component.balanceControl.valid).toBeFalsy()
    component.balanceControl.setValue(10000000000)
    expect(component.balanceControl.valid).toBeFalsy()
    component.balanceControl.setValue(10)
    expect(component.balanceControl.valid).toBe(true)
    component.balanceControl.setValue(1000)
    expect(component.balanceControl.valid).toBe(true)
  })

  it('should hold balance returned by backend API', () => {
    walletService.get.and.returnValue(of(100))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.balance).toBe('100.00')
  })

  it('should log error while getting balance from backend API directly to browser console', fakeAsync(() => {
    walletService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
