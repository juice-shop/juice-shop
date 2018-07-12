import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog'
import { UserService } from './../Services/user.service'
import { HttpClientModule } from '@angular/common/http'
import { MatDividerModule } from '@angular/material/divider'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserDetailsComponent } from './user-details.component'

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent
  let fixture: ComponentFixture<UserDetailsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatDividerModule,
        MatDialogModule
      ],
      declarations: [ UserDetailsComponent ],
      providers: [
        UserService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { productData: {} } }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  xit('should create', () => {
    expect(component).toBeTruthy()
  })
})
