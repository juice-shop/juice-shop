import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeCardComponent } from './challenge-card.component'

describe('ChallengeCard', () => {
  let component: ChallengeCardComponent
  let fixture: ComponentFixture<ChallengeCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChallengeCardComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(ChallengeCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
