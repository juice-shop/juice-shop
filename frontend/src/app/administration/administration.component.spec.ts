import { FeedbackService } from './../Services/feedback.service'
import { RecycleService } from './../Services/recycle.service'
import { UserService } from './../Services/user.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AdministrationComponent } from './administration.component'
import { MatTableModule } from '@angular/material/table'
import { HttpClientModule } from '@angular/common/http'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'

describe('AdministrationComponent', () => {
  let component: AdministrationComponent
  let fixture: ComponentFixture<AdministrationComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatTableModule,
        MatDialogModule
      ],
      declarations: [ AdministrationComponent ],
      providers: [MatDialog, UserService, RecycleService, FeedbackService]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
