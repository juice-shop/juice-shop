/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'

import { ErrorPageComponent } from './error-page.component'
import { ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent
  let fixture: ComponentFixture<ErrorPageComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        ErrorPageComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { error: 'UNAUTHORIZED_PAGE_ACCESS_ERROR' } } }
        }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
