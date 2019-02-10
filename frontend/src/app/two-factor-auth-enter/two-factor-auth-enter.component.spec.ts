import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter.component'

describe('TwoFactorAuthEnterComponent', () => {
  let component: TwoFactorAuthEnterComponent
  let fixture: ComponentFixture<TwoFactorAuthEnterComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFactorAuthEnterComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthEnterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
