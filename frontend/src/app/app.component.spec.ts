/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ClipboardModule } from 'ngx-clipboard'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { NavbarComponent } from './navbar/navbar.component'
import { SidenavComponent } from './sidenav/sidenav.component'
import { WelcomeComponent } from './welcome/welcome.component'
import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification/challenge-solved-notification.component'

import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatListModule } from '@angular/material/list'
import { MatCardModule } from '@angular/material/card'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatRadioModule } from '@angular/material/radio'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog'
import { LoginGuard } from './app.guard'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSearchBarComponent } from './mat-search-bar/mat-search-bar.component'
import { CookieModule } from 'ngy-cookie'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('AppComponent', () => {
  let app: AppComponent

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
        MatToolbarModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        ClipboardModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatRadioModule,
        MatDividerModule,
        MatListModule,
        MatDialogModule,
        NavbarComponent,
        WelcomeComponent,
        SidenavComponent,
        ChallengeSolvedNotificationComponent,
        ServerStartedNotificationComponent,
        MatSearchBarComponent,
        AppComponent],
      providers: [TranslateService, LoginGuard, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents()
  }))

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent)
    app = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the app', waitForAsync(() => {
    expect(app).toBeTruthy()
  }))
})
