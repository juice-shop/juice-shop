import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { PasswordStrengthInfoComponent } from './password-strength-info.component'

describe('PasswordStrengthInfoComponent', () => {
  let component: PasswordStrengthInfoComponent
  let fixture: ComponentFixture<PasswordStrengthInfoComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthInfoComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(PasswordStrengthInfoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // Unit tests for each conditional | passwordLength message
  it('should show weak message for length < 6', () => {
    component.passwordLength = 5;
    expect(component.getPasswordStrengthMessage()).toEqual('Weak');
  });

  it('should show medium message for length 6 to 8', () => {
    component.passwordLength = 7;
    expect(component.getPasswordStrengthMessage()).toEqual('Medium');
  });

  it('should show strong message for length > 8', () => {
    component.passwordLength = 9;
    expect(component.getPasswordStrengthMessage()).toEqual('Strong');
  });
})