/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { inject, TestBed } from '@angular/core/testing'
import { AccountingGuard, AdminGuard, DeluxeGuard, LoginGuard } from './app.guard'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { ErrorPageComponent } from './error-page/error-page.component'

describe('LoginGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
            { path: '403', component: ErrorPageComponent }
          ]
        )],
      providers: [LoginGuard]
    })
  })

  it('should be created', inject([LoginGuard], (guard: LoginGuard) => {
    expect(guard).toBeTruthy()
  }))
})

describe('AdminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
            { path: '403', component: ErrorPageComponent }
          ]
        )],
      providers: [AdminGuard, LoginGuard]
    })
  })

  it('should be created', inject([AdminGuard], (guard: AdminGuard) => {
    expect(guard).toBeTruthy()
  }))
})

describe('AccountingGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
            { path: '403', component: ErrorPageComponent }
          ]
        )],
      providers: [AccountingGuard, LoginGuard]
    })
  })

  it('should be created', inject([AccountingGuard], (guard: AccountingGuard) => {
    expect(guard).toBeTruthy()
  }))
})

describe('DeluxeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
            { path: '403', component: ErrorPageComponent }
          ]
        )],
      providers: [DeluxeGuard, LoginGuard]
    })
  })

  it('should be created', inject([DeluxeGuard], (guard: DeluxeGuard) => {
    expect(guard).toBeTruthy()
  }))
})
