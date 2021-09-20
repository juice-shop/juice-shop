/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { LayoutModule } from '@angular/cdk/layout'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { PrivacySecurityComponent } from './privacy-security.component'
import { ChangePasswordComponent } from '../change-password/change-password.component'
import { ReactiveFormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

describe('PrivacySecurityComponent', () => {
  let component: PrivacySecurityComponent
  let fixture: ComponentFixture<PrivacySecurityComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent, PrivacySecurityComponent],
      imports: [
        NoopAnimationsModule,
        LayoutModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatCardModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [TranslateService]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacySecurityComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
