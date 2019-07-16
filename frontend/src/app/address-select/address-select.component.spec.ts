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
import { AddressComponent } from '../address/address.component'
import { AddressSelectComponent } from './address-select.component'
import { RouterTestingModule } from '@angular/router/testing'
import { PaymentComponent } from '../payment/payment.component'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'

describe('AddressSelectComponent', () => {
  let component: AddressSelectComponent
  let fixture: ComponentFixture<AddressSelectComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'payment', component: PaymentComponent }
        ]),
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
        MatDialogModule
      ],
      declarations: [ AddressSelectComponent, AddressComponent, PaymentComponent, PaymentMethodComponent ],
      providers: []
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should store address id on calling getMessage', () => {
    component.getMessage(1)
    expect(component.addressId).toBe(1)
  })

  it('should store address id in session storage', () => {
    component.addressId = 1
    spyOn(sessionStorage,'setItem')
    component.chooseAddress()
    expect(sessionStorage.setItem).toHaveBeenCalledWith('addressId', 1)
  })
})
