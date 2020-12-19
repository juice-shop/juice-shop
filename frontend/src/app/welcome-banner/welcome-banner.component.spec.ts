/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { CookieService } from 'ngx-cookie-service'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeBannerComponent } from './welcome-banner.component'
import { MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

describe('WelcomeBannerComponent', () => {
  let component: WelcomeBannerComponent
  let fixture: ComponentFixture<WelcomeBannerComponent>
  let cookieService: any
  let matDialogRef: MatDialogRef<WelcomeBannerComponent>

  beforeEach(async(() => {
    matDialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatIconModule,
        MatTooltipModule
      ],
      declarations: [WelcomeBannerComponent],
      providers: [
       { provide: MatDialogRef, useValue: matDialogRef },
        CookieService
      ]
    })
    .compileComponents()

    cookieService = TestBed.inject(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeBannerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not dismiss if cookie not set', () => {
    component.ngOnInit()
    expect(matDialogRef.close).toHaveBeenCalledTimes(0)
  })

  it('should dismiss and add cookie when closed', () => {
    component.closeWelcome()
    expect(cookieService.get('welcomebanner_status')).toBe('dismiss')
    expect(matDialogRef.close).toHaveBeenCalled()
  })
})
