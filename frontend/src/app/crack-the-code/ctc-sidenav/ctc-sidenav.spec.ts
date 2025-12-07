import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcSidenav } from './ctc-sidenav';

describe('CtcSidenav', () => {
  let component: CtcSidenav;
  let fixture: ComponentFixture<CtcSidenav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcSidenav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcSidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
