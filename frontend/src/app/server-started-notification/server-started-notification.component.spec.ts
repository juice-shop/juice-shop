import { CookieModule } from 'ngx-cookie'
import { HttpClientModule } from '@angular/common/http'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ServerStartedNotificationComponent } from './server-started-notification.component'
import { ChallengeService } from '../Services/challenge.service'

describe('ServerStartedNotificationComponent', () => {
  let component: ServerStartedNotificationComponent
  let fixture: ComponentFixture<ServerStartedNotificationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientModule,
        MatCardModule,
        MatButtonModule
      ],
      declarations: [ ServerStartedNotificationComponent ],
      providers: [ ChallengeService, TranslateService]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerStartedNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
