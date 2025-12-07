import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcFooter } from './ctc-footer';

describe('CtcFooter', () => {
  let component: CtcFooter;
  let fixture: ComponentFixture<CtcFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
