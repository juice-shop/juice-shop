/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TranslateModule } from '@ngx-translate/core'
import { QrCodeComponent } from './qr-code.component'
import { MatButtonModule } from '@angular/material/button'
import { QrCodeModule } from 'ng-qrcode'

describe('QrCodeComponent', () => {
  let component: QrCodeComponent
  let fixture: ComponentFixture<QrCodeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        QrCodeModule,
        MatDividerModule,
        MatButtonModule,
        MatDialogModule,
        QrCodeComponent
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { data: 'data', url: 'url', address: 'address', title: 'title' } }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    component.ngOnInit()
    expect(component.title).toBe('title')
    expect(component.url).toBe('url')
    expect(component.address).toBe('address')
    expect(component.data).toBe('data')
  })
})
