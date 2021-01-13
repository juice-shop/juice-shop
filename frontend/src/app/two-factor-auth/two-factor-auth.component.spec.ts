/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TwoFactorAuthComponent } from './two-factor-auth.component'

import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TranslateModule } from '@ngx-translate/core'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { QRCodeModule } from 'anuglar2-qrcode'
import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { TwoFactorAuthService } from '../Services/two-factor-auth-service'

describe('TwoFactorAuthComponent', () => {
  let component: TwoFactorAuthComponent
  let fixture: ComponentFixture<TwoFactorAuthComponent>
  let twoFactorAuthService: any
  let configurationService: any

  beforeEach(waitForAsync(() => {
    twoFactorAuthService = jasmine.createSpyObj('TwoFactorAuthService', ['status', 'setup', 'disable'])
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { } }))
    TestBed.configureTestingModule({
      declarations: [TwoFactorAuthComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatButtonModule,
        QRCodeModule,
        MatSnackBarModule,
        MatTooltipModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: TwoFactorAuthService, useValue: twoFactorAuthService }
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })

  it('should set 2FA status, TOTP secret and URL as retrieved', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { name: 'Test App' } }))
    twoFactorAuthService.status.and.returnValue(of({ setup: false, email: 'email', secret: 'secret', setupToken: '12345' }))

    component.updateStatus()

    expect(component.setupStatus).toBe(false)
    expect(component.totpUrl).toBe('otpauth://totp/Test%20App:email?secret=secret&issuer=Test%20App')
    expect(component.totpSecret).toBe('secret')
  })
})
