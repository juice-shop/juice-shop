import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
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
import { throwError } from 'rxjs'
import { PaymentService } from '../Services/payment.service'
import { OrderCompletionComponent } from '../order-completion/order-completion.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DeliveryService } from '../Services/delivery.service'
import { DeluxeGuard } from '../app.guard'

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent
  let fixture: ComponentFixture<OrderSummaryComponent>
  let basketService: any
  let addressService: any
  let paymentService: any
  let deliveryService: any
  let deluxeGuard

  beforeEach(async(() => {

    addressService = jasmine.createSpyObj('AddressService',['getById'])
    addressService.getById.and.returnValue(of([]))
    basketService = jasmine.createSpyObj('BasketService', ['checkout', 'find'])
    basketService.find.and.returnValue(of({ Products: [] }))
    basketService.checkout.and.returnValue(of({}))
    paymentService = jasmine.createSpyObj('PaymentService', ['getById'])
    paymentService.getById.and.returnValue(of([]))
    deliveryService = jasmine.createSpyObj('DeliveryService', ['getById'])
    deliveryService.getById.and.returnValue(of({ price: 10 }))
    deluxeGuard = jasmine.createSpyObj('',['isDeluxe'])
    deluxeGuard.isDeluxe.and.returnValue(false)

    TestBed.configureTestingModule({
      declarations: [ OrderSummaryComponent, PurchaseBasketComponent, OrderCompletionComponent ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'order-completion', component: OrderCompletionComponent }
        ]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: BasketService, useValue: basketService },
        { provide: AddressService, useValue: addressService },
        { provide: PaymentService, useValue: paymentService },
        { provide: DeliveryService, useValue: deliveryService },
        { provide: DeluxeGuard, useValue: deluxeGuard }
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

  it('should log errors from address service directly to browser console', fakeAsync(() => {
    addressService.getById.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should log errors from payment service directly to browser console', fakeAsync(() => {
    sessionStorage.setItem('paymentId', '1')
    paymentService.getById.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should hold address on ngOnInit', () => {
    addressService.getById.and.returnValue(of({ address: 'address' }))
    component.ngOnInit()
    expect(component.address).toEqual({ address: 'address' })
  })

  it('should hold delivery price on ngOnInit', () => {
    deliveryService.getById.and.returnValue(of({ price: 10 }))
    component.ngOnInit()
    expect(component.deliveryPrice).toEqual(10)
  })

  it('should hold card on ngOnInit when paymentId is initialized to an id', () => {
    sessionStorage.setItem('paymentId', '1')
    paymentService.getById.and.returnValue(of({ cardNum: '1234123412341234' }))
    component.ngOnInit()
    expect(component.paymentMethod).toEqual({ cardNum: '1234' })
  })

  it('should be wallet on ngOnInit when paymentId is initialized to wallet', () => {
    sessionStorage.setItem('paymentId', 'wallet')
    component.ngOnInit()
    expect(component.paymentMethod).toEqual('wallet')
  })

  it('should store prices on calling getMessage', () => {
    sessionStorage.setItem('couponDiscount', '70')
    component.getMessage([100, 1])
    expect(component.itemTotal).toBe(100)
    expect(component.promotionalDiscount).toBe(70)
    expect(component.bonus).toBe(1)
  })

  it('should remove session details from session storage', () => {
    basketService.checkout.and.returnValue(of({ orderConfirmationId: '1234123412341234' }))
    spyOn(sessionStorage,'removeItem')
    component.placeOrder()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('paymentId')
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('addressId')
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('deliveryMethodId')
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('couponDetails')
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('couponDiscount')
  })
})
