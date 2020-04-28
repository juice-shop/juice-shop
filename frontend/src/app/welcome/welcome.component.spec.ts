/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialog } from '@angular/material/dialog'
import { CookieService } from 'ngx-cookie-service'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeComponent } from './welcome.component'

describe('WelcomeComponent', () => {
  let component: WelcomeComponent
  let cookieService: any
  let fixture: ComponentFixture<WelcomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [WelcomeComponent],
      providers: [
          { provide: MatDialog, useValue: {} },
        CookieService
      ]
    })
    .compileComponents()

    cookieService = TestBed.inject(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
