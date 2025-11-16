/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { UserService } from '../Services/user.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatDividerModule } from '@angular/material/divider'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { UserDetailsComponent } from './user-details.component'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent
  let fixture: ComponentFixture<UserDetailsComponent>
  let userService: any

  beforeEach(waitForAsync(() => {
    userService = jasmine.createSpyObj('UserService', ['get'])
    userService.get.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        MatDividerModule,
        MatDialogModule,
        UserDetailsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { dialogData: {} } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should log the error on retrieving user', () => {
    userService.get.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  })

  it('should set the retrieved user', () => {
    userService.get.and.returnValue(of('User'))
    component.ngOnInit()
    expect(component.user).toBe('User')
  })
})
