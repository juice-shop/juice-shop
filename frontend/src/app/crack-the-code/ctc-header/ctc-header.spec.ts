import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcHeader } from './ctc-header';

describe('CtcHeader', () => {
  let component: CtcHeader;
  let fixture: ComponentFixture<CtcHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
