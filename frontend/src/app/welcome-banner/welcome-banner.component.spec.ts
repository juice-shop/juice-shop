/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { CookieModule, CookieService } from 'ngy-cookie'

import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'

import { WelcomeBannerComponent } from './welcome-banner.component'
import { MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { of, throwError } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('WelcomeBannerComponent', () => {
  let component: WelcomeBannerComponent
  let fixture: ComponentFixture<WelcomeBannerComponent>
  let cookieService: any
  let matDialogRef: MatDialogRef<WelcomeBannerComponent>
  let configurationService: any

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { } }))
    matDialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        CookieModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        WelcomeBannerComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: ConfigurationService, useValue: configurationService },
        CookieService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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

  it('should dismiss and add cookie when starting hacking instructor', () => {
    component.startHackingInstructor()
    expect(cookieService.get('welcomebanner_status')).toBe('dismiss')
    expect(matDialogRef.close).toHaveBeenCalled()
  })

  it('should set banner properties as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { title: 'Title', message: 'Message' } } }))
    component.ngOnInit()

    expect(component.title).toBe('Title')
    expect(component.message).toBe('Message')
  })

  it('should show hacking instructor if enabled in configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ hackingInstructor: { isEnabled: true } }))
    component.ngOnInit()

    expect(component.showHackingInstructor).toBe(true)
  })

  it('should prevent dismissing banner in tutorial mode', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ challenges: { restrictToTutorialsFirst: true }, hackingInstructor: { isEnabled: true } }))
    component.ngOnInit()

    expect(component.dialogRef.disableClose).toBe(true)
    expect(component.showDismissBtn).toBe(false)
  })

  it('should log error on failure in retrieving configuration from backend', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
