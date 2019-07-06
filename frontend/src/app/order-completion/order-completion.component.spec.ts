import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatDialogModule } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { OrderCompletionComponent } from './order-completion.component'
import { TrackOrderService } from '../Services/track-order.service'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { BasketService } from '../Services/basket.service'
import { MatTooltipModule } from '@angular/material/tooltip'

export class MockActivatedRoute {
  public paramMap = of(convertToParamMap({
    id: 'ad9b-96017e7cb1ae7bf9'
  }))
}

describe('OrderCompletionComponent', () => {
  let component: OrderCompletionComponent
  let fixture: ComponentFixture<OrderCompletionComponent>
  let trackOrderService: any
  let activatedRoute: any
  let basketService: any

  beforeEach(async(() => {

    trackOrderService = jasmine.createSpyObj('TrackOrderService', ['save'])
    trackOrderService.save.and.returnValue(of({ data: [{}] }))
    activatedRoute = new MockActivatedRoute()

    TestBed.configureTestingModule({
      declarations: [ OrderCompletionComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDividerModule,
        MatGridListModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TrackOrderService, useValue: trackOrderService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: BasketService, useValue: basketService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCompletionComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should hold order details returned by backend API', () => {
    trackOrderService.save.and.returnValue(of({ data: [{ totalPrice: 2.88, products: [{ quantity: 1, name: 'Apple Juice (1000ml)', price: 1.99,total: 1.99, bonus: 0 },{ quantity: 1, name: 'Apple Pomace', price: 0.89, total: 0.89, bonus: 0 }], bonus: 0, eta: '5' }] }))
    component.ngOnInit()
    fixture.detectChanges()
    expect(component.orderDetails.totalPrice).toBe(2.88)
    expect(component.orderDetails.eta).toBe('5')
    expect(component.orderDetails.bonus).toBe(0)
    expect(component.orderDetails.products.length).toBe(2)
    expect(component.orderDetails.products[0].name).toBe('Apple Juice (1000ml)')
    expect(component.orderDetails.products[1].name).toBe('Apple Pomace')
  })

  it('should log error while getting order details from backend API directly to browser console' , fakeAsync(() => {
    trackOrderService.save.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

})
