import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackingChallengeProgressScoreCardComponent } from './hacking-challenge-progress-score-card.component';

describe('HackingChallengeProgressScoreCardComponent', () => {
  let component: HackingChallengeProgressScoreCardComponent;
  let fixture: ComponentFixture<HackingChallengeProgressScoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HackingChallengeProgressScoreCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HackingChallengeProgressScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
