import { ChallengeService } from '../Services/challenge.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { ConfigurationService } from '../Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { HttpClientModule } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngx-cookie'
import { LoginGuard } from '../app.guard'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SidenavComponent } from './sidenav.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list'

class MockSocket {
  on (str: string, callback: Function) {
    callback(str)
  }
}

describe('SidenavComponent', () => {
  let component: SidenavComponent
  let fixture: ComponentFixture<SidenavComponent>
  let challengeService: any
  let cookieService: any
  let configurationService: any
  let translateService: any
  let mockSocket: any
  let socketIoService: any
  let loginGuard

  beforeEach(async(() => {

    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    challengeService = jasmine.createSpyObj('ChallengeService',['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    cookieService = jasmine.createSpyObj('CookieService',['remove', 'get', 'put'])
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)
    loginGuard = jasmine.createSpyObj('LoginGuard',['tokenDecode'])
    loginGuard.tokenDecode.and.returnValue(of(true))

    TestBed.configureTestingModule({
      declarations: [ SidenavComponent ],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatListModule,
        CookieModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CookieService, useValue: cookieService },
        { provide: SocketIoService, useValue: socketIoService },
        { provide: LoginGuard, useValue: loginGuard },
        TranslateService
      ]
    })
    .compileComponents()

    translateService = TestBed.get(TranslateService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
