import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { of } from 'rxjs'

import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { ChallengesUnavailableWarningComponent } from './components/challenges-unavailable-warning/challenges-unavailable-warning.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { LegacyNoticeComponent } from './components/legacy-notice/legacy-notice.component'
import { TutorialModeWarningComponent } from './components/tutorial-mode-warning/tutorial-mode-warning.component'
import { WarningCardComponent } from './components/warning-card/warning-card.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { ScoreBoardComponent } from './score-board.component'
import { ConfigurationService } from '../Services/configuration.service'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { ChallengeService } from '../Services/challenge.service'
import { type Challenge } from '../Models/challenge.model'
import { ActivatedRoute, Router } from '@angular/router'

// allows to easily create a challenge with some overwrites
function createChallenge (challengeOverwrites: Partial<Challenge>): Challenge {
  return {
    name: 'foobar',
    key: 'challenge-1',
    category: 'category-blue',
    difficulty: 3,
    description: '',
    hint: '',
    tags: '',
    hintUrl: '',
    disabledEnv: null,
    solved: false,
    tutorialOrder: null,
    hasTutorial: false,
    hasSnippet: false,
    codingChallengeStatus: 0,
    mitigationUrl: '',
    ...challengeOverwrites
  }
}

describe('ScoreBoardPreviewComponent', () => {
  let component: ScoreBoardComponent
  let fixture: ComponentFixture<ScoreBoardComponent>
  let challengeService
  let codeSnippetService
  let configService
  let mockActivatedRoute
  let router: Router

  beforeEach(async () => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', [
      'challenges'
    ])
    configService = jasmine.createSpyObj('ConfigurationService', [
      'getApplicationConfiguration'
    ])

    mockActivatedRoute = {
      queryParams: of({})
    }

    await TestBed.configureTestingModule({
      declarations: [
        ScoreBoardComponent,
        HackingChallengeProgressScoreCardComponent,
        CodingChallengeProgressScoreCardComponent,
        DifficultyOverviewScoreCardComponent,
        WarningCardComponent,
        LegacyNoticeComponent,
        ChallengesUnavailableWarningComponent,
        TutorialModeWarningComponent,
        ScoreCardComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: ConfigurationService, useValue: configService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents()

    challengeService.find.and.returnValue(
      of([
        createChallenge({
          name: 'Challenge 1',
          key: 'challenge-1',
          category: 'category-blue',
          difficulty: 1,
          solved: true
        }),
        createChallenge({
          name: 'Challenge 2',
          key: 'challenge-2',
          category: 'category-blue',
          difficulty: 5,
          solved: false,
          hasSnippet: true,
          codingChallengeStatus: 1
        }),
        createChallenge({
          name: 'Challenge 3',
          key: 'challenge-3',
          category: 'category-red',
          difficulty: 3,
          hasSnippet: true,
          solved: false
        })
      ])
    )
    codeSnippetService.challenges.and.returnValue(of(['challenge-2']))
    configService.getApplicationConfiguration.and.returnValue(
      of({
        challenges: {
          restrictToTutorialsFirst: false,
          codingChallengesEnabled: true,
          showHints: true,
          showMitigations: true
        }
      })
    )

    fixture = TestBed.createComponent(ScoreBoardComponent)
    component = fixture.componentInstance
    router = TestBed.inject(Router) // Get the router from the test bed
    fixture.detectChanges()
  })

  it('should not filter any challenges on default settings', (): void => {
    expect(component.filteredChallenges).toHaveSize(3)
  })

  it('should properly identify that a challenge has a associated coding challenge', (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-2'
      ).hasCodingChallenge
    ).toBe(true)
  })

  it('should mark challenges as solved on "challenge solved" websocket', (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-3'
      ).solved
    ).toBeFalse()

    component.onChallengeSolvedWebsocket({
      key: 'challenge-3',
      name: '',
      challenge: '',
      flag: '',
      hidden: false,
      isRestore: false
    })

    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-3'
      ).solved
    ).toBeTrue()
  })

  it('should mark find it code challenges as solved on "code challenge solved" websocket', (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-3'
      ).codingChallengeStatus
    ).toBe(0)

    component.onCodeChallengeSolvedWebsocket({
      key: 'challenge-3',
      codingChallengeStatus: 1
    })

    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-3'
      ).codingChallengeStatus
    ).toBe(1)
  })

  it('should mark fix it code challenges as solved on "code challenge solved" websocket', (): void => {
    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-2'
      ).codingChallengeStatus
    ).toBe(1)

    component.onCodeChallengeSolvedWebsocket({
      key: 'challenge-2',
      codingChallengeStatus: 2
    })

    expect(
      component.filteredChallenges.find(
        (challenge) => challenge.key === 'challenge-2'
      ).codingChallengeStatus
    ).toBe(2)
  })

  it('should rewrite legacy challenge direct link', () => {
    const spy = spyOn(router, 'navigate') // Spy on the router's navigate method
    mockActivatedRoute.queryParams = of({ challenge: 'Score Board', searchQuery: null })
    component.ngOnInit()

    expect(spy).toHaveBeenCalledWith([], {
      queryParams: {
        challenge: null,
        searchQuery: 'Score Board'
      }
    })
  })
})
