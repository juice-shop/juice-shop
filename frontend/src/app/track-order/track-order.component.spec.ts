import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { TrackOrderComponent } from './track-order.component'
import { RouterTestingModule } from '@angular/router/testing'
import { ReactiveFormsModule } from '@angular/forms'

describe('TrackOrderComponent', () => {
  let component: TrackOrderComponent
  let fixture: ComponentFixture<TrackOrderComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ TrackOrderComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackOrderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
