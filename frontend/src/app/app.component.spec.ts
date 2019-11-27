import { CookieModule } from 'ngx-cookie'
import { ClipboardModule } from 'ngx-clipboard'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { async, TestBed } from '@angular/core/testing'
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
import { MatInputModule, MatSnackBarModule } from '@angular/material'
import { NgMatSearchBarModule } from 'ng-mat-search-bar'
import { MatRadioModule } from '@angular/material/radio'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog'
import { LoginGuard } from './app.guard'

describe('AppComponent', () => {
  let app: AppComponent

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        WelcomeComponent,
        SidenavComponent,
        ChallengeSolvedNotificationComponent,
        ServerStartedNotificationComponent
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
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
        NgMatSearchBarModule,
        MatRadioModule,
        MatDividerModule,
        MatListModule,
        MatDialogModule
      ],
      providers : [ TranslateService, LoginGuard ]
    }).compileComponents()
  }))

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent)
    app = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the app', async(() => {
    expect(app).toBeTruthy()
  }))
})
