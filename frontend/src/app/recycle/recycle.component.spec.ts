import { MatDatepickerModule } from '@angular/material/datepicker'
import { ConfigurationService } from './../Services/configuration.service'
import { UserService } from './../Services/user.service'
import { RecycleService } from './../Services/recycle.service'
import { HttpClientModule } from '@angular/common/http'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RecycleComponent } from './recycle.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatNativeDateModule } from '@angular/material/core'

describe('RecycleComponent', () => {
  let component: RecycleComponent
  let fixture: ComponentFixture<RecycleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      declarations: [ RecycleComponent ],
      providers: [
        RecycleService,
        UserService,
        ConfigurationService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RecycleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
