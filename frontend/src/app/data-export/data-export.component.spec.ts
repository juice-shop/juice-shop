import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { DataExportComponent } from './data-export.component'
import { MatCardModule } from '@angular/material/card'

describe('DataExportComponent', () => {
  let component: DataExportComponent
  let fixture: ComponentFixture<DataExportComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataExportComponent],
      imports: [
        MatCardModule
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExportComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })
})
