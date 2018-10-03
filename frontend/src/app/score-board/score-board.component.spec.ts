import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BarRatingModule } from 'ng2-bar-rating'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { WindowRefService } from '../Services/window-ref.service'
import { HttpClientModule } from '@angular/common/http'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { ScoreBoardComponent } from './score-board.component'
import { of, throwError } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { EventEmitter } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'

class MockSocket {
  on (str: string, callback) {
    callback(str)
  }
}

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent
  let fixture: ComponentFixture<ScoreBoardComponent>
  let challengeService
  let configurationService
  let windowRefService
  let translateService
  let sanitizer
  let socketIoService
  let mockSocket

  beforeEach(async(() => {

    challengeService = jasmine.createSpyObj('ChallengeService',['find','repeatNotification'])
    challengeService.find.and.returnValue(of([{}]))
    challengeService.repeatNotification.and.returnValue(of({}))
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {} }))
    // windowRefService = {
    //   get nativeWindow () {
    //     return {
    //       scrollTo: (a,b) => null
    //     }
    //   }
    // }
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    sanitizer = jasmine.createSpyObj('DomSanitizer',['bypassSecurityTrustHtml','sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args) => args)
    sanitizer.sanitize.and.returnValue({})
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket)

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatDividerModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatTooltipModule,
        MatButtonToggleModule
      ],
      declarations: [ ScoreBoardComponent ],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: DomSanitizer, useValue: sanitizer },
        { provide: SocketIoService, useValue: socketIoService },
        WindowRefService
      ]
    })
    .compileComponents()

    windowRefService = TestBed.get(WindowRefService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreBoardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold existing challenges', () => {
    challengeService.find.and.returnValue(of([ { description: 'XSS' }, { description: 'CSRF' } ]))
    component.ngOnInit()
    expect(component.challenges.length).toBe(2)
    expect(component.challenges[0].description).toBe('XSS')
    expect(component.challenges[1].description).toBe('CSRF')
  })

  it('should log the error on retrieving configuration', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should be able to toggle the difficulty and save it in localStorage', () => {
    component.scoreBoardTablesExpanded[2] = false
    spyOn(localStorage,'setItem')
    component.toggleDifficulty(2)
    expect(component.scoreBoardTablesExpanded[2]).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('scoreBoardTablesExpanded', JSON.stringify(component.scoreBoardTablesExpanded))
  })

  it('should consider challenge description as trusted HTML', () => {
    challengeService.find.and.returnValue(of([ { description: '<a src="link">Link</a>' } ]))
    component.ngOnInit()
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<a src="link">Link</a>')
  })

  it('should calculate percent of challenges solved', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: true }, { solved: false } ]))
    component.ngOnInit()
    expect(component.percentChallengesSolved).toBe('67')
  })

  it('should hold nothing when no challenges exists', () => {
    challengeService.find.and.returnValue(of([]))
    component.ngOnInit()
    expect(component.challenges).toEqual([])
  })

  it('should hold nothing on error from backend API and log the error', fakeAsync(() => {
    challengeService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(component.challenges).toBeUndefined()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should solve the score board challenge if it is solved', () => {
    challengeService.find.and.returnValue(of([ { name: 'Score Board', solved: false } ]))
    component.ngOnInit()
    expect(component.challenges[0].solved).toBe(true)
  })

  it('should return an empty array if challenges has a falsy value while filtering datasource', () => {
    let value = component.filterToDataSource(null,null,null)
    expect(value).toEqual([])
  })

  it('should return an empty array if challenges has a falsy value while filtering challenges by difficulty', () => {
    component.challenges = null
    let value = component.filterChallengesByDifficulty(null)
    expect(value).toEqual([])
  })

  it('should return an empty array if challenges has a falsy value while filtering solved challenges by difficulty', () => {
    component.challenges = null
    let value = component.filterSolvedChallengesOfDifficulty(null)
    expect(value).toEqual([])
  })

  it('should complete a level when all challenges of that difficulty are solved', () => {
    challengeService.find.and.returnValue(of([ { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 } ]))
    component.ngOnInit()
    expect(component.offsetValue[2]).toBe('0%')
  })

  it('should update the correct challenge when a challenge solved event occurs', () => {
    challengeService.find.and.returnValue(of([{ name: 'Challenge #1', solved: false }, { name: 'Challenge #2', solved: false } ]))
    spyOn(mockSocket,'on')
    component.ngOnInit()
    let callback = mockSocket.on.calls.argsFor(0)[1]
    callback({ challenge: 'ping', name: 'Challenge #1' })
    expect(component.challenges[ 0 ].solved).toBe(true)
    expect(component.challenges[ 1 ].solved).toBe(false)
  })

  it('should not update when a challenge solved event to a nonexistent challenge occurs', () => {
    challengeService.find.and.returnValue(of([{ name: 'Challenge #1', solved: false }, { name: 'Challenge #2', solved: false } ]))
    spyOn(mockSocket,'on')
    component.ngOnInit()
    let callback = mockSocket.on.calls.argsFor(0)[1]
    callback({ challenge: 'ping', name: 'Challenge #1337' })
    expect(component.challenges[ 0 ].solved).toBe(false)
    expect(component.challenges[ 1 ].solved).toBe(false)
  })

  it('should be possible when challenge-solved notifications are shown with CTF flag codes', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({  'ctf': { 'showFlagsInNotifications': true }, 'application': { 'showChallengeSolvedNotifications': true } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(true)
  })

  it('should not be possible when challenge-solved notifications are shown without CTF flag codes', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'ctf': { 'showFlagsInNotifications': false }, 'application': { 'showChallengeSolvedNotifications': true } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(false)
  })

  it('should not be possible when challenge-solved notifications are not shown', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeSolvedNotifications': false } }))
    component.ngOnInit()
    expect(component.allowRepeatNotifications).toBe(false)
  })

  it('should show notification for selected challenge when enabled', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'ctf': { 'showFlagsInNotifications': true }, 'application': { 'showChallengeSolvedNotifications': true } }))
    component.ngOnInit()
    component.repeatNotification({ name: 'Challenge #1', solved: true })
    expect(challengeService.repeatNotification).toHaveBeenCalledWith(encodeURIComponent('Challenge #1'))
  })

  it('should scroll to top of screen when notification is repeated', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'ctf': { 'showFlagsInNotifications': true }, 'application': { 'showChallengeSolvedNotifications': true } }))
    spyOn(windowRefService.nativeWindow,'scrollTo')
    component.ngOnInit()
    component.repeatNotification({ name: 'Challenge #1', solved: true })
    expect(windowRefService.nativeWindow.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('should log the error from backend on failing to repeat notification', fakeAsync(() => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'ctf': { 'showFlagsInNotifications': true }, 'application': { 'showChallengeSolvedNotifications': true } }))
    challengeService.repeatNotification.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    component.repeatNotification({ name: 'Challenge #1', solved: true })
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should happen when challenge has a hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    spyOn(windowRefService.nativeWindow,'open')
    component.ngOnInit()
    component.openHint({ name: 'Challenge #1', hintUrl: 'hint://c1.test' })
    expect(windowRefService.nativeWindow.open).toHaveBeenCalledWith('hint://c1.test', '_blank')
  })

  it('should not happen when challenge has no hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    spyOn(windowRefService.nativeWindow,'open')
    component.ngOnInit()
    component.openHint({ name: 'Challenge #2' })
    expect(windowRefService.nativeWindow.open).not.toHaveBeenCalled()
  })

  it('should not happen when hints are not turned on in configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': false } }))
    spyOn(windowRefService.nativeWindow,'open')
    component.ngOnInit()
    component.openHint({ name: 'Challenge #1', hintUrl: 'hint://c1.test' })
    expect(windowRefService.nativeWindow.open).not.toHaveBeenCalled()
  })

  it('should be empty for challenge with neither hint text nor URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    challengeService.find.and.returnValue(of([ { name: 'Challenge' } ]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBeUndefined()
  })

  it('should remain unchanged for challenge with a hint text but no hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    challengeService.find.and.returnValue(of([ { name: 'Challenge', hint: 'Hint' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('Hint')
  })

  it('should append click-me text for challenge with a hint text and URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hint: 'Hint.', hintUrl: 'http://hi.nt' } ]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('Hint. Click for more hints.')
  })

  it('should become click-me text for challenge without a hint text but with hint URL', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ 'application': { 'showChallengeHints': true } }))
    challengeService.find.and.returnValue(of([{ name: 'Challenge', hintUrl: 'http://hi.nt' }]))
    component.ngOnInit()
    expect(component.challenges[0].hint).toBe('Click to open hints.')
  })

})
