import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { OrderSummaryComponent } from './order-summary.component'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { RouterTestingModule } from '@angular/router/testing'
import { BasketService } from '../Services/basket.service'
import { AddressService } from '../Services/address.service'
import { of } from 'rxjs/internal/observable/of'

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent
  let fixture: ComponentFixture<OrderSummaryComponent>
  let basketService: any
  let addressService: any
  let paymentService: any

  beforeEach(async(() => {

    addressService = jasmine.createSpyObj('AddressService',['getById'])
    addressService.getById.and.returnValue(of([]))
    basketService = jasmine.createSpyObj('BasketService', ['checkout', 'find'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.checkout.and.returnValue(of({}))
    paymentService = jasmine.createSpyObj('BasketService', ['getById'])
    paymentService.getById.and.returnValue(of([]))

    TestBed.configureTestingModule({
      declarations: [ OrderSummaryComponent, PurchaseBasketComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule
      ],
      providers: [
        { provide: BasketService, useValue: basketService },
        { provide: AddressService, useValue: addressService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSummaryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
