import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreBoardPreviewComponent } from './score-board-preview.component';

describe('ScoreBoardPreviewComponent', () => {
  let component: ScoreBoardPreviewComponent;
  let fixture: ComponentFixture<ScoreBoardPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreBoardPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreBoardPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
