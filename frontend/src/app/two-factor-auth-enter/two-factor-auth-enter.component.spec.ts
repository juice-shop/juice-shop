/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter.component'
import { SearchResultComponent } from '../search-result/search-result.component'
import { UserService } from '../Services/user.service'
import { WindowRefService } from '../Services/window-ref.service'

import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TranslateModule } from '@ngx-translate/core'
import { CookieService } from 'ngx-cookie-service'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { of } from 'rxjs'

describe('TwoFactorAuthEnterComponent', () => {
  let component: TwoFactorAuthEnterComponent
  let fixture: ComponentFixture<TwoFactorAuthEnterComponent>
  let userService: any

  beforeEach(waitForAsync(() => {
    userService = jasmine.createSpyObj('UserService', ['login'])
    userService.login.and.returnValue(of({}))
    userService.isLoggedIn = jasmine.createSpyObj('userService.isLoggedIn', ['next'])
    userService.isLoggedIn.next.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'search', component: SearchResultComponent }
        ]),
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatButtonModule,
        MatGridListModule,
        MatSnackBarModule,
        MatTooltipModule
      ],
      declarations: [ TwoFactorAuthEnterComponent, SearchResultComponent ],
      providers: [
        { provide: UserService, useValue: userService },
        CookieService,
        WindowRefService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthEnterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
