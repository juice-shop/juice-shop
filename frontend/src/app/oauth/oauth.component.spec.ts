import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { OAuthComponent } from './oauth.component'

describe('OAuthComponent', () => {
  let component: OAuthComponent
  let fixture: ComponentFixture<OAuthComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OAuthComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OAuthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
