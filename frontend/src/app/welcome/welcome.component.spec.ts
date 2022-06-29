/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { CookieModule, CookieService } from 'ngx-cookie'

import { ComponentFixture, TestBed } from '@angular/core/testing'

import { WelcomeComponent } from './welcome.component'
import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'

describe('WelcomeComponent', () => {
  let component: WelcomeComponent
  let configurationService: any
  let cookieService: any
  let fixture: ComponentFixture<WelcomeComponent>
  let dialog: any

  beforeEach(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {} }))
    dialog = jasmine.createSpyObj('MatDialog', ['open'])
    dialog.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientTestingModule,
        MatDialogModule
      ],
      declarations: [WelcomeComponent],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: MatDialog, useValue: dialog },
        CookieService
      ]
    })
      .compileComponents()

    cookieService = TestBed.inject(CookieService)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent)
    component = fixture.componentInstance
    cookieService.remove('welcomebanner_status')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should open the welcome banner dialog if configured to show on start', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: true } } }))
    component.ngOnInit()
    expect(dialog.open).toHaveBeenCalled()
  })

  it('should not open the welcome banner dialog if configured to not show on start', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: false } } }))
    component.ngOnInit()
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('should not open the welcome banner dialog if previously dismissed', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: true } } }))
    cookieService.put('welcomebanner_status', 'dismiss')
    component.ngOnInit()
    expect(dialog.open).not.toHaveBeenCalled()
  })
})
