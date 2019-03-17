import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { LastLoginIpComponent } from './last-login-ip.component'
import { MatCardModule } from '@angular/material'

describe('LastLoginIpComponent', () => {
  let component: LastLoginIpComponent
  let fixture: ComponentFixture<LastLoginIpComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LastLoginIpComponent],
      imports: [
        MatCardModule
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LastLoginIpComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
