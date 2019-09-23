import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BarRatingModule } from 'ng2-bar-rating'
import { MatTableModule } from '@angular/material/table'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { MatRadioModule } from '@angular/material/radio'
import { MatDialogModule } from '@angular/material/dialog'
import { SavedAddressComponent } from './saved-address.component'
import { AddressComponent } from '../address/address.component'
import { RouterTestingModule } from '@angular/router/testing'
import { MatCheckboxModule, MatIconModule, MatTooltipModule } from '@angular/material'

describe('SavedAddressComponent', () => {
  let component: SavedAddressComponent
  let fixture: ComponentFixture<SavedAddressComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        BarRatingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatDividerModule,
        MatRadioModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule
      ],
      declarations: [ SavedAddressComponent, AddressComponent ],
      providers: []
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedAddressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
