import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DifficultyOverviewScoreCardComponent } from './difficulty-overview-score-card.component'
import { ScoreCardComponent } from '../score-card/score-card.component'

describe('DifficultyOverviewScoreCardComponent', () => {
  let component: DifficultyOverviewScoreCardComponent
  let fixture: ComponentFixture<DifficultyOverviewScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DifficultyOverviewScoreCardComponent,
        ScoreCardComponent
      ]
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
})
