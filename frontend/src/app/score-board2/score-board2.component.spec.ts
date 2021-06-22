import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ScoreBoard2Component } from './score-board2.component'

describe('ScoreBoard2Component', () => {
  let component: ScoreBoard2Component
  let fixture: ComponentFixture<ScoreBoard2Component>

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      declarations: [ScoreBoard2Component]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreBoard2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
