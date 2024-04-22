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
})
