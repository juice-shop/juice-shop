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

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent
  let fixture: ComponentFixture<OrderSummaryComponent>

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ OrderSummaryComponent, PurchaseBasketComponent ],
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
      providers: []
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
