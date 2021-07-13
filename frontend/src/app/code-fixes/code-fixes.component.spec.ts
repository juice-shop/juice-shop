import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CodeFixesComponent } from './code-fixes.component'

describe('CodeFixesComponent', () => {
  let component: CodeFixesComponent
  let fixture: ComponentFixture<CodeFixesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeFixesComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeFixesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
