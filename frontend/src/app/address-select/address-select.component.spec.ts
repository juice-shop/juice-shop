/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { AddressComponent } from '../address/address.component'
import { AddressSelectComponent } from './address-select.component'
import { RouterTestingModule } from '@angular/router/testing'
import { DeliveryMethodComponent } from '../delivery-method/delivery-method.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AddressSelectComponent', () => {
  let component: AddressSelectComponent
  let fixture: ComponentFixture<AddressSelectComponent>
  let snackBar: any
  let translateService

  beforeEach(waitForAsync(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])
    snackBar.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: 'delivery-method', component: DeliveryMethodComponent }
      ]),
      TranslateModule.forRoot(),
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
      MatTooltipModule,
      MatCheckboxModule,
      AddressSelectComponent, AddressComponent, DeliveryMethodComponent],
      providers: [{ provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should store address id on calling getMessage', () => {
    component.getMessage(1)
    expect(component.addressId).toBe(1)
  })
})
