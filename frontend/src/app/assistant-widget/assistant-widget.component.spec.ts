import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { AssistantWidgetComponent } from './assistant-widget.component'

describe('AssistantWidgetComponent', () => {
  let fixture: ComponentFixture<AssistantWidgetComponent>
  let component: AssistantWidgetComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AssistantWidgetComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(AssistantWidgetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should toggle the widget panel when the button is clicked', () => {
    expect(component.isOpen).toBeFalse()

    component.toggleWidget()
    fixture.detectChanges()

    expect(component.isOpen).toBeTrue()
  })
})
