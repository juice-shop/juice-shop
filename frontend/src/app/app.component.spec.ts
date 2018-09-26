import { environment } from './../environments/environment'
import { CookieModule } from 'ngx-cookie'
import { ClipboardModule } from 'ngx-clipboard'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { ConfigurationService } from './Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { HttpClientModule } from '@angular/common/http'
import { RouterTestingModule } from '@angular/router/testing'
import { TestBed, async } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { NavbarComponent } from './navbar/navbar.component'
import { ChallengeSolvedNotificationComponent } from 'src/app/challenge-solved-notification/challenge-solved-notification.component'
import { SocketIoModule } from 'ng-socket-io'

import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatCardModule } from '@angular/material/card'

describe('AppComponent', () => {
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        ChallengeSolvedNotificationComponent,
        ServerStartedNotificationComponent
      ],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatToolbarModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        SocketIoModule.forRoot({ url: environment.hostServer, options: {} }),
        ClipboardModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule
      ],
      providers : [ TranslateService, ConfigurationService ]
    }).compileComponents()
  }))
  xit('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.debugElement.componentInstance
    expect(app).toBeTruthy()
  }))
})
