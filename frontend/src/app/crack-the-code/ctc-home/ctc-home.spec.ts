import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcHome } from './ctc-home';

describe('CtcHome', () => {
  let component: CtcHome;
  let fixture: ComponentFixture<CtcHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
