import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreCardComponent } from '../score-card/score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './coding-challenge-progress-score-card.component'
import { TranslateModule } from '@ngx-translate/core'

describe('CodingChallengeProgressScoreCardComponent', () => {
  let component: CodingChallengeProgressScoreCardComponent
  let fixture: ComponentFixture<CodingChallengeProgressScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ScoreCardComponent,
        CodingChallengeProgressScoreCardComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(CodingChallengeProgressScoreCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should update challengeCategories when allChallenges input changes', () => {
    const initialChallenges = [
      { category: 'Category1', hasCodingChallenge: true, codingChallengeStatus: 1 },
      { category: 'Category1', hasCodingChallenge: true, codingChallengeStatus: 0 },
      { category: 'Category2', hasCodingChallenge: true, codingChallengeStatus: 0 },
      { category: 'Category2', hasCodingChallenge: false }
    ]

    const updatedChallenges = [
      { category: 'Category1', hasCodingChallenge: true, codingChallengeStatus: 2 },
      { category: 'Category1', hasCodingChallenge: true, codingChallengeStatus: 1 },
      { category: 'Category2', hasCodingChallenge: true, codingChallengeStatus: 0 },
      { category: 'Category2', hasCodingChallenge: false }
    ]

    component.allChallenges = initialChallenges as any
    component.ngOnChanges({ allChallenges: { currentValue: initialChallenges, previousValue: [], firstChange: true, isFirstChange: () => true } })

    expect(component.challengeCategories).toEqual([
      { name: 'Category1', solved: 1, total: 4 },
      { name: 'Category2', solved: 0, total: 2 }
    ])

    component.allChallenges = updatedChallenges as any
    component.ngOnChanges({ allChallenges: { currentValue: updatedChallenges, previousValue: initialChallenges, firstChange: false, isFirstChange: () => false } })

    expect(component.challengeCategories).toEqual([
      { name: 'Category1', solved: 3, total: 4 },
      { name: 'Category2', solved: 0, total: 2 }
    ])
  })
})
