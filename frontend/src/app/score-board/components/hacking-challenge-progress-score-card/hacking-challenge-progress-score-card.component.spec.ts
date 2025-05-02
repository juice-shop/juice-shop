import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { HackingChallengeProgressScoreCardComponent } from './hacking-challenge-progress-score-card.component'
import { TranslateModule } from '@ngx-translate/core'
import { ScoreCardComponent } from '../score-card/score-card.component'

describe('HackingChallengeProgressScoreCardComponent', () => {
  let component: HackingChallengeProgressScoreCardComponent
  let fixture: ComponentFixture<HackingChallengeProgressScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ScoreCardComponent, HackingChallengeProgressScoreCardComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(HackingChallengeProgressScoreCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should update challengeCategories when allChallenges input changes', () => {
    const initialChallenges = [
      { category: 'Category1', solved: true },
      { category: 'Category1', solved: false },
      { category: 'Category2', solved: false }
    ]

    const updatedChallenges = [
      { category: 'Category1', solved: true },
      { category: 'Category1', solved: true },
      { category: 'Category3', solved: false }
    ]

    component.allChallenges = initialChallenges as any
    component.ngOnChanges({ allChallenges: { currentValue: initialChallenges, previousValue: [], firstChange: true, isFirstChange: () => true } })

    expect(component.challengeCategories).toEqual([
      { name: 'Category1', solved: 1, total: 2 },
      { name: 'Category2', solved: 0, total: 1 }
    ])

    component.allChallenges = updatedChallenges as any
    component.ngOnChanges({ allChallenges: { currentValue: updatedChallenges, previousValue: initialChallenges, firstChange: false, isFirstChange: () => false } })

    expect(component.challengeCategories).toEqual([
      { name: 'Category1', solved: 2, total: 2 },
      { name: 'Category3', solved: 0, total: 1 }
    ])
  })
})
