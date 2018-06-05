import { MatInputModule } from '@angular/material/input'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { ConfigurationService } from 'src/app/Services/configuration.service'
import { WindowRefService } from './../Services/window-ref.service'
import { UserService } from './../Services/user.service'
import { BasketService } from './../Services/basket.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BasketComponent } from './basket.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'

describe('BasketComponent', () => {
  let component: BasketComponent
  let fixture: ComponentFixture<BasketComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatExpansionModule,
        MatDialogModule
      ],
      declarations: [ BasketComponent ],
      providers: [MatDialog,BasketService, UserService, WindowRefService,ConfigurationService]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
