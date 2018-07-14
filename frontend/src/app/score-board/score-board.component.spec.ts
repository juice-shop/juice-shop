import { BarRatingModule } from 'ng2-bar-rating'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ChallengeService } from './../Services/challenge.service'
import { ConfigurationService } from './../Services/configuration.service'
import { WindowRefService } from './../Services/window-ref.service'
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

describe('ScoreBoardComponent', () => {
  let component: ScoreBoardComponent
  let fixture: ComponentFixture<ScoreBoardComponent>
  let challengeService
  let configurationService
  let sanitizer

  beforeEach(async(() => {

    challengeService = jasmine.createSpyObj('ChallengeService',['find','repeatNotification'])
    challengeService.find.and.returnValue(of([{}]))
    challengeService.repeatNotification.and.returnValue(of({}))
    configurationService = jasmine.createSpyObj('ConfigurationService',['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {} }))
    sanitizer = jasmine.createSpyObj('DomSanitizer',['bypassSecurityTrustHtml','sanitize'])
    sanitizer.bypassSecurityTrustHtml.and.callFake((args) => args)
    sanitizer.sanitize.and.returnValue({})

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatDividerModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatTooltipModule
      ],
      declarations: [ ScoreBoardComponent ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: DomSanitizer, useValue: sanitizer },
        WindowRefService
      ]
    })
    .compileComponents()
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

  it('should colorize total score in warn for less than 25% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: false }, { solved: false }, { solved: false }, { solved: false } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('warn')
  })

  it('should colorize total score in warn for exactly 25% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: false }, { solved: false }, { solved: false } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('warn')
  })

  it('should colorize total score in primary for more than 25% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: false } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('primary')
  })

  it('should colorize total score in primary for exactly 75% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: true }, { solved: true }, { solved: false } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('primary')
  })

  it('should colorize total score in accent for more than 75% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true }, { solved: true }, { solved: true }, { solved: true }, { solved: false } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('accent')
  })

  it('should colorize total score in accent for exactly 100% challenge completion', () => {
    challengeService.find.and.returnValue(of([ { solved: true } ]))
    component.ngOnInit()
    expect(component.completionColor).toBe('accent')
  })

  it('should complete a level when all challenges of that difficulty are solved', () => {
    challengeService.find.and.returnValue(of([ { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 }, { solved: true, difficulty: 3 } ]))
    component.ngOnInit()
    expect(component.offsetValue[2]).toBe('0%')
  })

})
