import { LayoutModule } from '@angular/cdk/layout'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import {
  MatButtonModule,
  MatCardModule,
  MatGridListModule,
  MatIconModule,
  MatMenuModule
} from '@angular/material'

import { LastLoginIpComponent } from './last-login-ip.component'

describe('LastLoginIpComponent', () => {
  let component: LastLoginIpComponent
  let fixture: ComponentFixture<LastLoginIpComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LastLoginIpComponent],
      imports: [
        NoopAnimationsModule,
        LayoutModule,
        MatButtonModule,
        MatCardModule,
        MatGridListModule,
        MatIconModule,
        MatMenuModule
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
