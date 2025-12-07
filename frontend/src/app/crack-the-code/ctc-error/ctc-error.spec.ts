import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcError } from './ctc-error';

describe('CtcError', () => {
  let component: CtcError;
  let fixture: ComponentFixture<CtcError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
