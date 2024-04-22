import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { DifficultyOverviewScoreCardComponent } from './difficulty-overview-score-card.component'
import { ScoreCardComponent } from '../score-card/score-card.component'
import { TranslateModule } from '@ngx-translate/core'

describe('DifficultyOverviewScoreCardComponent', () => {
  let component: DifficultyOverviewScoreCardComponent
  let fixture: ComponentFixture<DifficultyOverviewScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ScoreCardComponent,
        DifficultyOverviewScoreCardComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(DifficultyOverviewScoreCardComponent)
    component = fixture.componentInstance
    component.allChallenges = []
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('difficultySummaries', () => {
    it('should calculate difficulty summaries correctly for empty list of challenges', () => {
      expect(DifficultyOverviewScoreCardComponent.calculateDifficultySummaries([])).toEqual([
        { difficulty: 1, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 2, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 3, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
      ])
    })
    it('should calculate difficulty summaries', () => {
      expect(DifficultyOverviewScoreCardComponent.calculateDifficultySummaries([
        { difficulty: 1, solved: true, hasCodingChallenge: false } as any,
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 1 } as any
      ])).toEqual([
        { difficulty: 1, availableChallenges: 4, solvedChallenges: 3 },
        { difficulty: 2, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 3, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
      ])
    })
    it('should calculate difficulty summaries for multiple difficulties', () => {
      expect(DifficultyOverviewScoreCardComponent.calculateDifficultySummaries([
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 0 } as any,
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 0 } as any,
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 1 } as any,
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 2 } as any,
        { difficulty: 1, solved: false, hasCodingChallenge: true, codingChallengeStatus: 0 } as any,
        { difficulty: 2, solved: true, hasCodingChallenge: true, codingChallengeStatus: 0 } as any,
        { difficulty: 3, solved: false, hasCodingChallenge: true, codingChallengeStatus: 0 } as any
      ])).toEqual([
        { difficulty: 1, availableChallenges: 15, solvedChallenges: 7 },
        { difficulty: 2, availableChallenges: 3, solvedChallenges: 1 },
        { difficulty: 3, availableChallenges: 3, solvedChallenges: 0 },
        { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
      ])
    })
  })
})
