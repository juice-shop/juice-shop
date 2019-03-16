import { ChallengeService } from '../Services/challenge.service'
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { ConfigurationService } from '../Services/configuration.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'
import { HttpClientModule } from '@angular/common/http'
import { Location } from '@angular/common'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SidenavComponent } from './sidenav.component'
import { RouterTestingModule } from '@angular/router/testing'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list'

class MockSocket {
  on (str: string, callback) {
  callback(str)
}
}

describe('SidenavComponent', () => {
  let component: SidenavComponent
  let fixture: ComponentFixture<SidenavComponent>
  let challengeService
  let configurationService
  let translateService
  let mockSocket
  let socketIoService
  let location

  beforeEach(async(() => {

    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({}))
    challengeService = jasmine.createSpyObj('ChallengeService',['find'])
    challengeService.find.and.returnValue(of([{ solved: false }]))
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)

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
        MatListModule
      ],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: SocketIoService, useValue: socketIoService },
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
