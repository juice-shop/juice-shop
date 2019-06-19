import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { BasketService } from '../Services/basket.service'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of } from 'rxjs'
import { throwError } from 'rxjs/internal/observable/throwError'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { OrderSummaryComponent } from './order-summary.component'

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent
  let fixture: ComponentFixture<OrderSummaryComponent>
  let basketService

  beforeEach(async(() => {

    basketService = jasmine.createSpyObj('BasketService', ['find'])
    basketService.find.and.returnValue(of({ Products: [] }))

    TestBed.configureTestingModule({
      declarations: [ OrderSummaryComponent ],
      imports: [
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
        { provide: BasketService, useValue: basketService }
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

  it('should hold products returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [{ name: 'Product1', price: 1, BasketItem: { quantity: 1 } }, { name: 'Product2', price: 2, BasketItem: { quantity: 2 } }] }))
    component.ngOnInit()
    expect(component.dataSource.length).toBe(2)
    expect(component.dataSource[0].name).toBe('Product1')
    expect(component.dataSource[0].price).toBe(1)
    expect(component.dataSource[0].BasketItem.quantity).toBe(1)
    expect(component.dataSource[1].name).toBe('Product2')
    expect(component.dataSource[1].price).toBe(2)
    expect(component.dataSource[1].BasketItem.quantity).toBe(2)
  })

  it('should hold no products on error in backend API', fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.dataSource.length).toBe(0)
  }))

  it('should hold no products when none are returned by backend API', () => {
    basketService.find.and.returnValue(of({ Products: [] }))
    component.ngOnInit()
    expect(component.dataSource).toEqual([])
  })

  it('should log error while getting Products from backend API directly to browser console' , fakeAsync(() => {
    basketService.find.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
