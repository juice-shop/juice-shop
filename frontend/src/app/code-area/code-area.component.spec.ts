import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'

import { CodeAreaComponent } from './code-area.component'

describe('CodeAreaComponent', () => {
  let component: CodeAreaComponent
  let fixture: ComponentFixture<CodeAreaComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      declarations: [CodeAreaComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeAreaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should generate unchecked markers for each line of the code snippet', () => {
    component.code = 'Line 1\nLine2\nLine3'
    component.ngOnInit()
    expect(component.lineMarkers).toEqual([{ lineNumber: 1, marked: false }, { lineNumber: 2, marked: false }, { lineNumber: 3, marked: false }])
  })

  it('should emit selected line of code when no lines were previously selected', () => {
    component.addLine = jasmine.createSpyObj(['emit'])
    component.lineMarkers = [{ lineNumber: 1, marked: false }, { lineNumber: 2, marked: false }, { lineNumber: 3, marked: false }]
    component.selectLines(2)
    expect(component.addLine.emit).toHaveBeenCalledWith([2])
  })

  it('should emit selected line of code including previously selected lines', () => {
    component.addLine = jasmine.createSpyObj(['emit'])
    component.lineMarkers = [{ lineNumber: 1, marked: true }, { lineNumber: 2, marked: false }, { lineNumber: 3, marked: false }]
    component.selectLines(2)
    expect(component.addLine.emit).toHaveBeenCalledWith([1, 2])
  })

  it('should emit selected lines of code minus a deselected one', () => {
    component.addLine = jasmine.createSpyObj(['emit'])
    component.lineMarkers = [{ lineNumber: 1, marked: true }, { lineNumber: 2, marked: true }, { lineNumber: 3, marked: true }]
    component.selectLines(2)
    expect(component.addLine.emit).toHaveBeenCalledWith([1, 3])
  })
})
