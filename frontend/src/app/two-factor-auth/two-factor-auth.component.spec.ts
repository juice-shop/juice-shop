import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TwoFactorAuthComponent } from './two-factor-auth.component'
import { MatCardModule } from '@angular/material/card'

describe('TwoFactorAuthComponent', () => {
  let component: TwoFactorAuthComponent
  let fixture: ComponentFixture<TwoFactorAuthComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TwoFactorAuthComponent],
      imports: [
        MatCardModule
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorAuthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
