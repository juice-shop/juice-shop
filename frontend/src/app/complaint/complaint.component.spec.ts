import { ComplaintService } from './../Services/complaint.service'
import { UserService } from './../Services/user.service'
import { FileUploadService } from './../Services/file-upload.service'
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'

import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ComplaintComponent } from './complaint.component'

describe('ComplaintComponent', () => {
  let component: ComplaintComponent
  let fixture: ComponentFixture<ComplaintComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ ComplaintComponent ],
      providers: [FileUploadService, UserService, ComplaintService]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplaintComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
