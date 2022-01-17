/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { SavedAddressComponent } from './saved-address.component'
import { AddressComponent } from '../address/address.component'
import { RouterTestingModule } from '@angular/router/testing'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatCheckboxModule } from '@angular/material/checkbox'

describe('SavedAddressComponent', () => {
  let component: SavedAddressComponent
  let fixture: ComponentFixture<SavedAddressComponent>
  let snackBar: any

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
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
        MatTooltipModule,
        MatCheckboxModule
      ],
      declarations: [SavedAddressComponent, AddressComponent],
      providers: [{ provide: MatSnackBar, useValue: snackBar }]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedAddressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
