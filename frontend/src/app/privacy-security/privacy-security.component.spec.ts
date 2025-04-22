/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { PrivacySecurityComponent } from './privacy-security.component'
import { RouterOutlet } from '@angular/router'

describe('PrivacySecurityComponent', () => {
  let component: PrivacySecurityComponent
  let fixture: ComponentFixture<PrivacySecurityComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterOutlet,
        PrivacySecurityComponent
      ]
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
