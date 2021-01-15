/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { of } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { DeluxeUserComponent } from './deluxe-user.component'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie-service'
import { LoginComponent } from '../login/login.component'
import { Location } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ConfigurationService } from '../Services/configuration.service'
import { throwError } from 'rxjs/internal/observable/throwError'

describe('DeluxeUserComponent', () => {
  let component: DeluxeUserComponent
  let fixture: ComponentFixture<DeluxeUserComponent>
  let userService
  let cookieService: any
  let configurationService: any

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { } }))
    userService = jasmine.createSpyObj('UserService', ['deluxeStatus', 'upgradeToDeluxe', 'saveLastLoginIp'])
    userService.deluxeStatus.and.returnValue(of({}))
    userService.upgradeToDeluxe.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})
    userService.saveLastLoginIp.and.returnValue(of({}))
    cookieService = jasmine.createSpyObj('CookieService', ['delete'])

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginComponent }
        ]),
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
        MatCheckboxModule,
        MatTooltipModule
      ],
      declarations: [DeluxeUserComponent, LoginComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: CookieService, useValue: cookieService }
      ]
    })
      .compileComponents()
    TestBed.inject(Location)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DeluxeUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold membership cost on ngOnInit', () => {
    userService.deluxeStatus.and.returnValue(of({ membershipCost: 30 }))
    component.ngOnInit()
    expect(component.membershipCost).toEqual(30)
  })

  it('should set application name and logo as obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { name: 'Name', logo: 'Logo' } }))
    component.ngOnInit()

    expect(component.applicationName).toBe('Name')
    expect(component.logoSrc).toBe('assets/public/images/Logo')
  })

  it('should assemble internal logo location from image base path and URL obtained from configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { logo: 'http://test.com/logo.jpg' } }))
    component.ngOnInit()

    expect(component.logoSrc).toBe('assets/public/images/logo.jpg')
  })

  it('should log error on failure in retrieving configuration from backend', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
