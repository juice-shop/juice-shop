import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtcLogin } from './ctc-login';

describe('CtcLogin', () => {
  let component: CtcLogin;
  let fixture: ComponentFixture<CtcLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtcLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtcLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
