import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CodingChallengeProgressScoreCardComponent } from './coding-challenge-progress-score-card.component'
import { ScoreCardComponent } from '../score-card/score-card.component'

describe('CodingChallengeProgressScoreCardComponent', () => {
  let component: CodingChallengeProgressScoreCardComponent
  let fixture: ComponentFixture<CodingChallengeProgressScoreCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CodingChallengeProgressScoreCardComponent,
        ScoreCardComponent
      ]
    })
    .compileComponents()

    fixture = TestBed.createComponent(CodingChallengeProgressScoreCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
