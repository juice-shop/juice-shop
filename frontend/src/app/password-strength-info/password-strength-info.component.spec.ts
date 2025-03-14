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

  xit('should create', () => {
    expect(component).toBeTruthy()
  })

  // todo: unit test each conditional | passwordLength message
})
