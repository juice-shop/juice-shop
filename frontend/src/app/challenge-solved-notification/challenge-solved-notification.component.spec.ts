import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'

describe('ChallengeSolvedNotificationComponent', () => {
  let component: ChallengeSolvedNotificationComponent
  let fixture: ComponentFixture<ChallengeSolvedNotificationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallengeSolvedNotificationComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeSolvedNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
