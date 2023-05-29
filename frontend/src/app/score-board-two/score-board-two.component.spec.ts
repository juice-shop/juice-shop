import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreBoardTwoComponent } from './score-board-two.component';

describe('ScoreBoardTwoComponent', () => {
  let component: ScoreBoardTwoComponent;
  let fixture: ComponentFixture<ScoreBoardTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreBoardTwoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreBoardTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
