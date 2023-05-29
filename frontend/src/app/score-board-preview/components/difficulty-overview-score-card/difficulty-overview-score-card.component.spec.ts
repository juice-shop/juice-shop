import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DifficultyOverviewScoreCardComponent } from './difficulty-overview-score-card.component'

describe('DifficultyOverviewScoreCardComponent', () => {
  let component: DifficultyOverviewScoreCardComponent
  let fixture: ComponentFixture<DifficultyOverviewScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DifficultyOverviewScoreCardComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(DifficultyOverviewScoreCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('difficultySummaries', () => {
    it('should calculate difficulty summaries correctly for empty list of challenges', () => {
      expect(component.calculateDifficultySummaries([])).toEqual([
        { difficulty: 1, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 2, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 3, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
      ])
    })
    it('should calculate difficulty summaries', () => {
      expect(component.calculateDifficultySummaries([
        { difficulty: 1, solved: true, hasCodingChallenge: false } as any,
        { difficulty: 1, solved: true, hasCodingChallenge: true, codingChallengeStatus: 1 } as any
      ])).toEqual([
        { difficulty: 1, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 2, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 3, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 4, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 5, availableChallenges: 0, solvedChallenges: 0 },
        { difficulty: 6, availableChallenges: 0, solvedChallenges: 0 }
      ])
    })
  })
})
