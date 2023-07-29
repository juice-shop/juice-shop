import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatDialogModule } from '@angular/material/dialog'
import { of } from 'rxjs'

import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { ChallengeService } from '../Services/challenge.service'
import { TranslateModule } from '@ngx-translate/core'
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { PreviewFeatureNoticeComponent } from './components/preview-feature-notice/preview-feature-notice.component'
import { ChallengesUnavailableWarningComponent } from './components/challenges-unavailable-warning/challenges-unavailable-warning.component'
import { TutorialModeWarningComponent } from './components/tutorial-mode-warning/tutorial-mode-warning.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { WarningCardComponent } from './components/warning-card/warning-card.component'
import { MatIconModule } from '@angular/material/icon'

describe('ScoreBoardPreviewComponent', () => {
  let component: ScoreBoardPreviewComponent
  let fixture: ComponentFixture<ScoreBoardPreviewComponent>
  let challengeService
  let codeSnippetService

  beforeEach(async () => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['find'])
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', [
      'challenges'
    ])
    await TestBed.configureTestingModule({
      declarations: [
        ScoreBoardPreviewComponent,
        HackingChallengeProgressScoreCardComponent,
        CodingChallengeProgressScoreCardComponent,
        DifficultyOverviewScoreCardComponent,
        WarningCardComponent,
        PreviewFeatureNoticeComponent,
        ChallengesUnavailableWarningComponent,
        TutorialModeWarningComponent,
        ScoreCardComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [
        { provide: ChallengeService, useValue: challengeService },
        { provide: CodeSnippetService, useValue: codeSnippetService }
      ]
    }).compileComponents()

    challengeService.find.and.returnValue(of([]))
    codeSnippetService.challenges.and.returnValue(of([]))

    fixture = TestBed.createComponent(ScoreBoardPreviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
