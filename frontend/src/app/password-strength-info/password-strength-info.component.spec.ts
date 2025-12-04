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
    component.passwordComponent = { minLength: 8 } as any
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
